import { asDimensions, asNumberMeasurements, asSlice, asStringMeasurements, Cube, SliceValue, MetaGridEntry, Measurement, Dimension } from "../klicker"
import { ChiSquared } from 'sampson'

/* c&p from util */
export function getSeasonEnd(timestamp: Date) {
  const trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'))
  const diff = timestamp.getTime() - trophySeasonEnd.getTime()
  const seasonsSince = Math.ceil(diff/1000/60/60/24/7/2)
  trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince*7*2)
  return trophySeasonEnd
}

const monthAgo = new Date()
monthAgo.setMonth(monthAgo.getMonth() - 1)

/**
 * Calculate $m.useRate / sum($m.useRate over all dimensions except brawler)
 */
function percentageOver(measurementId: string, overDimension: Dimension) {
  const rowIdWithout = (row: MetaGridEntry) =>
    row.id.replace(`${overDimension.id}=${row.dimensionsRaw[overDimension.id][overDimension.naturalIdAttribute]};`, '')

  return (entries: MetaGridEntry[]) => {
    if (entries.length == 0 || !(overDimension.id in entries[0].dimensionsRaw)) {
      return entries.map(row => row.measurementsRaw[measurementId] as number)
    }

    const total: Record<string, number> = {}
    entries.forEach((row) => {
      const key = rowIdWithout(row)

      if (!(key in total)) {
        total[key] = 0
      }

      total[key] += row.measurementsRaw[measurementId] as number
    })

    return entries.map(row => {
      const key = rowIdWithout(row)
      return row.measurementsRaw[measurementId] as number / total[key]
    })
  }
}

function calculateGTestStatistic(expectations: number[], observations: number[]) {
  if (expectations.length != observations.length) {
    throw new Error(`Invalid chisq test, cardinality of expectations ${expectations.length} does not match cardinality of observations ${observations.length}`)
  }

  let g = 0
  for (let i = 0; i < observations.length; i++) {
    g += observations[i] * Math.log(observations[i] / expectations[i])
  }

  return 2*g
}

function binomialTest(getK: (d: MetaGridEntry['measurementsRaw']) => number, getN: (d: MetaGridEntry['measurementsRaw']) => number) {
  // approximate a binomial test using the G-test
  return (r: MetaGridEntry['measurementsRaw'], t: MetaGridEntry['measurementsRaw']) => {
    const total = getN(r) + getN(t)
    const totalSuccesses = getK(r) + getK(t)
    const totalFailures = total - totalSuccesses

    const expectedSuccessesR = getN(r) * totalSuccesses / total
    const expectedFailuresR = getN(r) * totalFailures / total
    const expectedSuccessesT = getN(t) * totalSuccesses / total
    const expectedFailuresT = getN(t) * totalFailures / total

    const observedSuccessesR = getK(r)
    const observedFailuresR = getN(r) - getK(r)
    const observedSuccessesT = getK(t)
    const observedFailuresT = getN(t) - getK(t)

    const g = calculateGTestStatistic(
      [expectedSuccessesR, expectedFailuresR, expectedSuccessesT, expectedFailuresT],
      [observedSuccessesR, observedFailuresR, observedSuccessesT, observedFailuresT])

    return ChiSquared.pdf(g, {
      // df: (rows - 1) * (columns - 1)
      df: 1
    })
  }
}

function binomialCI(getK: (d: MetaGridEntry['measurementsRaw']) => number, getN: (d: MetaGridEntry['measurementsRaw']) => number) {
  // normal 95% approximation interval
  return (d: MetaGridEntry['measurementsRaw']) => {
    const z = 1.96
    const n = getN(d)
    const p = getK(d) / n
    const diff = z*Math.sqrt(p * (1 - p) / n)
    return {
      lower: Math.max(0.0, p - diff),
      upper: Math.min(1.0, p + diff),
    }
  }
}


// TODO get standard deviations and implement t test for non-binomial attributes

const metaDimensions = asDimensions({
  season: {
    id: 'season',
    name: 'Bi-Week',
    childIds: ['day', 'timestamp'],
    naturalIdAttribute: 'season',
    formatter: 'yyyy-MM-dd',
    additionalMeasures: [],
    type: 'temporal',
    scale: {
      nice: 'week',
    },
    config: {
      sql: 'trophy_season_end',
      type: 'time',
    },
  },
  day: {
    id: 'day',
    name: 'Day',
    childIds: ['timestamp'],
    naturalIdAttribute: 'day',
    formatter: 'yyyy-MM-dd',
    additionalMeasures: [],
    type: 'temporal',
    scale: {
      nice: 'day',
    },
    config: {
      sql: 'toStartOfDay(timestamp)',
      type: 'time',
    },
  },
  timestamp: {
    id: 'timestamp',
    name: 'Timestamp',
    naturalIdAttribute: 'timestamp',
    formatter: 'yyyy-MM-ddTHH:mm',
    additionalMeasures: [],
    type: 'temporal',
    scale: {
      nice: 'hour',
    },
    config: {
      sql: 'timestamp',
      type: 'time',
    },
  },
})

const playerDimensions = asDimensions({
  player: {
    id: 'player',
    name: 'Player',
    naturalIdAttribute: 'playerName',
    additionalMeasures: ['playerName', 'playerIcon'],
    type: 'nominal',
    config: {
      sql: 'player_id',
      type: 'string',
    },
  },
})

const brawlerDimensions = asDimensions({
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    childIds: ['gadget', 'starpower'],
    naturalIdAttribute: 'brawler',
    formatter: 'capitalizeWords',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'brawler_name',
      type: 'string',
    },
  },
  brawlerId: {
    id: 'brawlerId',
    name: 'Brawler ID',
    childIds: ['brawler', 'gadget', 'starpower'],
    naturalIdAttribute: 'brawlerId',
    additionalMeasures: [],
    hidden: true,
    type: 'nominal',
    config: {
      sql: 'brawler_id',
      type: 'string',
    },
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    naturalIdAttribute: 'ally',
    formatter: 'capitalizeWords',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'ally_brawler_name',
      type: 'string',
    },
  },
  allyId: {
    id: 'allyId',
    name: 'Ally ID',
    childIds: ['ally'],
    naturalIdAttribute: 'allyId',
    additionalMeasures: [],
    hidden: true,
    type: 'nominal',
    config: {
      sql: 'ally_brawler_id',
      type: 'string',
    },
  },
  gadget: {
    id: 'gadget',
    name: 'Gadget',
    naturalIdAttribute: 'gadgetName',
    formatter: 'capitalizeWords',
    additionalMeasures: ['gadgetName', 'brawler'],
    type: 'nominal',
    config: {
      sql: 'brawler_gadget_id',
      type: 'string',
    },
  },
  starpower: {
    id: 'starpower',
    name: 'Star Power',
    naturalIdAttribute: 'starpowerName',
    formatter: 'capitalizeWords',
    additionalMeasures: ['starpowerName', 'brawler'],
    type: 'nominal',
    config: {
      sql: 'brawler_starpower_id',
      type: 'string',
    },
  },
  bigbrawler: {
    id: 'bigbrawler',
    name: 'Big Brawler',
    naturalIdAttribute: 'bigbrawler',
    formatter: 'y/n',
    additionalMeasures: [],
    hidden: true,
    type: 'nominal',
    config: {
      sql: 'battle_is_bigbrawler',
      type: 'boolean',
    },
  },
  trophyRange: {
    id: 'trophyRange',
    name: 'Trophy Range',
    naturalIdAttribute: 'trophyRange',
    additionalMeasures: [],
    hidden: true,
    type: 'ordinal',
    formatter: 'trophyRange',
    config: {
      sql: 'brawler_trophyrange',
      type: 'string',
    },
  },
})

const battleDimensions = asDimensions({
  mode: {
    id: 'mode',
    name: 'Mode',
    childIds: ['map'],
    naturalIdAttribute: 'mode',
    formatter: 'formatMode',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'battle_event_mode',
      type: 'string',
    },
  },
  map: {
    id: 'map',
    name: 'Map',
    naturalIdAttribute: 'map',
    additionalMeasures: ['mode', 'eventId'],
    type: 'nominal',
    config: {
      sql: 'battle_event_map',
      type: 'string',
    },
  },
  team: {
    id: 'team',
    name: 'Team',
    naturalIdAttribute: 'team',
    formatter: 'capitalizeWords',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name]))',
      type: 'string',
    },
  },
  teamSize: {
    id: 'teamSize',
    name: 'Team size',
    childIds: ['team'],
    naturalIdAttribute: 'team',
    additionalMeasures: [],
    hidden: true,
    type: 'quantitative',
    config: {
      sql: 'length(battle_allies.brawler_name) + 1',
      type: 'number',
    },
  },
  powerplay: {
    id: 'powerplay',
    name: 'Power Play',
    naturalIdAttribute: 'powerplay',
    formatter: 'y/n',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'battle_event_powerplay',
      type: 'boolean',
    },
  },
})

const commonDimensions = asDimensions({
  ...playerDimensions,
  ...brawlerDimensions,
  ...metaDimensions,
  ...battleDimensions,
})

const picks = 'SUM(picks)'
const winRate = `toFloat64(AVG(battle_victory))`
const zP = 'least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)'

const winRateMerged = `toFloat64(avgMerge(battle_victory_state))`
const winratePosteriorMerged = `(1583+${winRateMerged}*${picks})/(1583/${zP}+${picks})`

const picksRaw = 'COUNT()'
const winratePosteriorRaw = `(1583+${winRate}*${picksRaw})/(1583/${zP}+${picksRaw})`

export const playerStringMeasurements = asStringMeasurements({
  playerName: {
    id: 'playerName',
    name: 'Most common name',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(player_name)',
      type: 'number',
    },
  },
  clubName: {
    id: 'clubName',
    name: 'Most common Club name',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(player_club_name)',
      type: 'number',
    },
  },
  playerIcon: {
    id: 'playerIcon',
    name: 'Most common icon',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(player_icon_id)',
      type: 'number',
    },
  },
  playerNameColor: {
    id: 'playerNameColor',
    name: 'Most common color',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(player_name_color)',
      type: 'number',
    },
  },
})

const playerNumberMeasurements = asNumberMeasurements({
  playerTrophies: {
    id: 'playerTrophies',
    name: 'Player Trophies',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_trophies',
      type: 'max',
    },
  },
  playerHighestTrophies: {
    id: 'playerHighestTrophies',
    name: 'Player Highest Trophies',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_highest_trophies',
      type: 'max',
    },
  },
  victories: {
    id: 'victories',
    name: '3v3 Victories',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_3vs3_victories',
      type: 'max',
    },
  },
  exp: {
    id: 'exp',
    name: 'Experience',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_exp',
      type: 'max',
    },
  },
  soloVictories: {
    id: 'soloVictories',
    name: 'Solo Victories',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_solo_victories',
      type: 'max',
    },
  },
  duoVictories: {
    id: 'duoVictories',
    name: 'Duo Victories',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_duo_victories',
      type: 'max',
    },
  },
  users: {
    id: 'users',
    name: 'Players',
    description: 'The total number of players.',
    formatter: '.1s',
    d3formatter: '.1s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'uniqCombined(player_id)',
      type: 'number',
    },
  },
  powerPlayPoints: {
    id: 'powerPlayPoints',
    name: 'Power Play Points',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'player_power_play_points',
      type: 'max',
    },
  },
  highestPowerPlayPoints: {
    id: 'highestPowerPlayPoints',
    name: 'Highest Power Play Points',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'player_highest_power_play_points',
      type: 'max',
    },
  },
  expLevel: {
    id: 'expLevel',
    name: 'EXP Level',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'player_exp_level',
      type: 'max',
    },
  },
  expPoints: {
    id: 'expPoints',
    name: 'EXP',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'player_exp_points',
      type: 'max',
    },
  },
  brawlers: {
    id: 'brawlers',
    name: 'Brawlers',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'player_brawlers_length',
      type: 'max',
    },
  },
})

export const brawlerStringMeasurements = asStringMeasurements({
  brawler: {
    id: 'brawler',
    name: 'Most played Brawler',
    formatter: 'capitalizeWords',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'anyHeavy(brawler_name)',
      type: 'number',
    },
  },
})

export const brawlerNumberMeasurements = asNumberMeasurements({
  highestTrophies: {
    id: 'highestTrophies',
    name: 'Highest Trophies',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'brawler_highest_trophies',
      type: 'max',
    },
  },
  trophies: {
    id: 'trophies',
    name: 'Trophies',
    description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'brawler_trophies',
      type: 'avg',
    },
  },
  starpowers: {
    id: 'starpowers',
    name: 'Star Powers',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'brawler_starpowers_length',
      type: 'max',
    },
  },
  gadgets: {
    id: 'gadgets',
    name: 'Gadgets',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'brawler_gadgets_length',
      type: 'max',
    },
  },
})

const metaMeasurements = asStringMeasurements({
  timestamp: {
    // TODO
    id: 'timestamp',
    name: 'Last Update',
    formatter: 'yyyy-MM-ddTHH:mm',
    sign: -1,
    type: 'temporal',
    config: {
      sql: 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
  day: {
    // TODO
    id: 'day',
    name: 'Day',
    formatter: 'yyyy-MM-dd',
    sign: -1,
    type: 'temporal',
    config: {
      sql: 'formatDateTime(MAX(toStartOfDay(timestamp)), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
})

const battleNumberMeasurements = asNumberMeasurements({
  trophyChange: {
    id: 'trophyChange',
    name: 'Trophy Change',
    formatter: '+.2f',
    d3formatter: '+.2f',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_trophy_change',
      type: 'avg',
    },
  },
  winRate: {
    id: 'winRate',
    name: 'Win Rate',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_victory',
      type: 'avg',
    },
    statistics: {
      test: {
      name: 'G-Test',
        test: binomialTest(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  winRateAdj: {
    id: 'winRateAdj',
    name: 'Adjusted Win Rate',
    description: 'For Brawlers with few picks, the Adjusted Win Rate is interpolated using a Bayesian Average.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: winratePosteriorRaw,
      type: 'number',
    },
  },
  wins: {
    id: 'wins',
    name: 'Wins',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'battle_victory',
      type: 'sum',
    },
  },
  winsZScore: {
    id: 'winsZScore',
    name: 'Wins z-Score',
    description: 'The Wins z-score uses a statistical test to compare the wins of Brawlers with a Star Power / Gadget to those without. Scores higher/lower than 2 are good/bad.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: '', // TODO needs join
      type: 'number',
    },
  },
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: '',
      type: 'count',
    },
  },
  pickRate: {
    id: 'pickRate',
    name: 'Pick Rate',
    description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: '',
      type: 'count',
    },
    transform: percentageOver('pickRate', brawlerDimensions.brawler),
  },
  useRate: {
    id: 'useRate',
    name: 'Use Rate',
    description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_brawlers_length',
      type: 'sum',
    },
    transform: percentageOver('useRate', brawlerDimensions.brawler),
  },
  starRate: {
    id: 'starRate',
    name: 'Star Player',
    description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_is_starplayer',
      type: 'avg',
    },
    statistics: {
      test: {
      name: 'G-Test',
        test: binomialTest(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  rank: {
    id: 'rank',
    name: 'Average Rank',
    description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: +1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_rank',
      type: 'avg',
    },
  },
  rank1: {
    id: 'rank1',
    name: '#1 Recorded',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'battle_rank1',
      type: 'sum',
    },
  },
  rank1Rate: {
    id: 'rank1Rate',
    name: '#1 Rate',
    description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_rank1',
      type: 'avg',
    },
  },
  duration: {
    id: 'duration',
    name: 'Duration',
    description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
    formatter: 'duration',
    d3formatter: 'duration',
    sign: +1,
    type: 'quantitative',
    config: {
      sql: 'battle_duration',
      type: 'avg',
    },
  },
  level: {
    id: 'level',
    name: 'Average Level',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_level',
      type: 'avg',
    },
  },
  power: {
    id: 'power',
    name: 'Power',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'brawler_power',
      type: 'avg',
    },
  },
})

const battleStringMeasurements = asStringMeasurements({
  starpowerName: {
    id: 'starpowerName',
    name: 'Star Power',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(brawler_starpower_name)',
      type: 'number',
    },
  },
  gadgetName: {
    id: 'gadgetName',
    name: 'Gadget',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(brawler_gadget_name)',
      type: 'number',
    },
  },
  eventId: {
    id: 'eventId',
    name: 'Event ID',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(battle_event_id)',
      type: 'number',
    },
  },
  map: {
    id: 'map',
    name: 'Map',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(battle_event_map)',
      type: 'number',
    },
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    sign: -1,
    type: 'nominal',
    config: {
      sql: 'any(battle_event_mode)',
      type: 'number',
    },
  },
})

// same as battleMeasurements, but using clickhouse merge for mv
const mergedbattleStringMeasurements = asStringMeasurements({
  timestamp: {
    id: 'timestamp',
    name: 'Last Update',
    formatter: 'yyyy-MM-ddTHH:mm',
    sign: -1,
    type: 'temporal',
    config: {
      sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
})

const mergedbattleNumberMeasurements = asNumberMeasurements({
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: 'sum(picks)',
      type: 'number',
    },
  },
  trophyChange: {
    id: 'trophyChange',
    name: 'Trophy Change',
    formatter: '+.2f',
    d3formatter: '+.2f',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_trophy_change_state)',
      type: 'number',
    },
  },
  winRate: {
    id: 'winRate',
    name: 'Win Rate',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_victory_state)',
      type: 'number',
    },
    statistics: {
      test: {
      name: 'G-Test',
        test: binomialTest(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  winRateAdj: {
    id: 'winRateAdj',
    name: 'Adjusted Win Rate',
    description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: winratePosteriorMerged,
      type: 'number',
    },
  },
  wins: {
    id: 'wins',
    name: 'Wins',
    description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: `${winRateMerged}*${picks}`,
      type: 'number',
    },
  },
  pickRate: {
    id: 'pickRate',
    name: 'Pick Rate',
    description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'SUM(picks)',
      type: 'number',
    },
    transform: percentageOver('pickRate', brawlerDimensions.brawler),
  },
  useRate: {
    id: 'useRate',
    name: 'Use Rate',
    description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'picks_weighted',
      type: 'sum',
    },
    transform: percentageOver('useRate', brawlerDimensions.brawler),
  },
  starRate: {
    id: 'starRate',
    name: 'Star Player',
    description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_starplayer_state)',
      type: 'number',
    },
    statistics: {
      test: {
      name: 'G-Test',
        test: binomialTest(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  rank: {
    id: 'rank',
    name: 'Average Rank',
    description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: +1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_rank_state)',
      type: 'number',
    },
  },
  rank1Rate: {
    id: 'rank1Rate',
    name: '#1 Rate',
    description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_rank1_state)',
      type: 'number',
    },
    statistics: {
      test: {
      name: 'G-Test',
        test: binomialTest(m => (m['rank1Rate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMeasurements: ['picks'],
      },
      ci: {
        ci: binomialCI(m => (m['rank1Rate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  duration: {
    id: 'duration',
    name: 'Duration',
    description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
    formatter: 'duration',
    d3formatter: 'duration',
    sign: +1,
    type: 'quantitative',
    config: {
      sql: 'avgMerge(battle_duration_state)',
      type: 'number',
    },
  },
  level: {
    id: 'level',
    name: 'Average Level',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_level_state)',
      type: 'number',
    },
  },
})

export const commonMeasurements = {
  ...metaMeasurements,
  ...playerStringMeasurements,
  ...playerNumberMeasurements,
  ...brawlerStringMeasurements,
  ...brawlerNumberMeasurements,
  ...battleStringMeasurements,
  ...battleNumberMeasurements,
}

const metaSlices = asSlice({
  season: {
    id: 'season',
    config: {
      member: 'season_dimension',
      operator: 'afterDate',
    },
  },
  seasonExact: {
    id: 'seasonExact',
    config: {
      member: 'season_dimension',
      operator: 'equals',
    }
  },
  timestamp: {
    id: 'timestamp',
    config: {
      member: 'timestamp_dimension',
      operator: 'afterDate',
    }
  },
})

const playerSlices = asSlice({
  playerName: {
    id: 'playerName',
    config: {
      member: 'player_name_dimension',
      operator: 'contains',
    },
  },
  playerId: {
    id: 'playerId',
    config: {
      member: 'player_dimension',
      operator: 'equals',
    },
  },
})

const brawlerSlices = asSlice({
  brawler: {
    id: 'brawler',
    config: {
      member: 'brawler_dimension',
      operator: 'equals',
    },
  },
  brawlerId: {
    id: 'brawlerId',
    config: {
      member: 'brawler_id_dimension',
      operator: 'equals',
    },
  },
  ally: {
    id: 'ally',
    config: {
      member: 'ally_brawler_dimension',
      operator: 'equals',
    },
  },
  allyId: {
    id: 'allyId',
    config: {
      member: 'ally_brawler_id_dimension',
      operator: 'equals',
    },
  },
  trophyRangeGte: {
    id: 'trophyRangeGte',
    config: {
      member: 'trophyRange_dimension',
      operator: 'gte',
    },
  },
  trophyRangeLt: {
    id: 'trophyRangeLt',
    config: {
      member: 'trophyRange_dimension',
      operator: 'lt',
    },
  },
  powerGte: {
    id: 'powerGte',
    config: {
      member: 'power_measure',
      operator: 'gte',
    },
  },
  powerLte: {
    id: 'powerLte',
    config: {
      member: 'power_measure',
      operator: 'lte',
    },
  },
  starpowerIdEq: {
    id: 'starpowerIdEq',
    config: {
      member: 'starpower_dimension',
      operator: 'equals',
    },
  },
  starpowerIdNeq: {
    id: 'starpowerIdNeq',
    config: {
      member: 'starpower_dimension',
      operator: 'notEquals',
    },
  },
  gadgetIdEq: {
    id: 'gadgetIdEq',
    config: {
      member: 'gadget_dimension',
      operator: 'equals',
    },
  },
  gadgetIdNeq: {
    id: 'gadgetIdNeq',
    config: {
      member: 'gadget_dimension',
      operator: 'notEquals',
    },
  },
})

const battleSlices = asSlice({
  mode: {
    id: 'mode',
    config: {
      member: 'mode_dimension',
      operator: 'equals',
    },
  },
  map: {
    id: 'map',
    config: {
      member: 'map_dimension',
      operator: 'equals',
    },
  },
  id: {
    id: 'id',
    config: {
      member: 'eventId_measure',
      operator: 'equals',
    },
  },
  mapLike: {
    id: 'mapLike',
    config: {
      member: 'map_dimension',
      operator: 'contains',
    },
  },
  mapNotLike: {
    id: 'mapNotLike',
    config: {
      member: 'map_dimension',
      operator: 'notContains',
    },
  },
  powerplay: {
    id: 'powerplay',
    config: {
      member: 'powerplay_dimension',
      operator: 'equals',
    },
  },
  bigbrawler: {
    id: 'bigbrawler',
    config: {
      member: 'bigbrawler_dimension',
      operator: 'equals',
    },
  },
  teamSizeGt: {
    id: 'teamSizeGt',
    config: {
      member: 'teamSize_dimension',
      operator: 'gt',
    },
  },
  teamContains: {
    id: 'teamContains',
    config: {
      member: 'team_dimension',
      operator: 'contains',
    },
  },
})

const commonSlices = asSlice({
  ...metaSlices,
  ...playerSlices,
  ...battleSlices,
  ...brawlerSlices,
})

const brawlerBattleMeasurements = [
  /*
  mergedbattleMeasurements.trophySeasonEnd,
  */
  commonMeasurements.mode,
  commonMeasurements.map,
  commonMeasurements.eventId,
  mergedbattleStringMeasurements.timestamp,
  mergedbattleNumberMeasurements.trophyChange,
  mergedbattleNumberMeasurements.winRate,
  mergedbattleNumberMeasurements.winRateAdj,
  mergedbattleNumberMeasurements.wins,
  mergedbattleNumberMeasurements.picks,
  mergedbattleNumberMeasurements.pickRate,
  mergedbattleNumberMeasurements.useRate,
  mergedbattleNumberMeasurements.starRate,
  mergedbattleNumberMeasurements.rank,
  mergedbattleNumberMeasurements.rank1Rate,
  mergedbattleNumberMeasurements.duration,
  mergedbattleNumberMeasurements.level,
  commonMeasurements.brawler,
]

const brawlerBattleDimensions = [
  commonDimensions.brawler,
  commonDimensions.season,
  commonDimensions.trophyRange,
]

const brawlerBattleSlices = [
  commonSlices.season,
  commonSlices.seasonExact,
  commonSlices.trophyRangeGte,
  commonSlices.trophyRangeLt,
  commonSlices.brawler,
]

const brawlerBattleDefaultSliceValues: SliceValue = {
  season: [getSeasonEnd(monthAgo).toISOString().slice(0, 10)],
  trophyRangeGte: ['0'],
  brawler: [],
}

const playerBrawlerDimensions = [
  commonDimensions.season,
  commonDimensions.timestamp,
  commonDimensions.day,
  commonDimensions.player,
  commonDimensions.brawler,
  commonDimensions.brawlerId,
  commonDimensions.trophyRange,
]

const playerBrawlerMeasurements = [
  commonMeasurements.picks,
  commonMeasurements.pickRate,
  commonMeasurements.useRate,
  commonMeasurements.users,
  // commonMeasurements.season,
  commonMeasurements.timestamp,
  commonMeasurements.day,
  commonMeasurements.playerName,
  commonMeasurements.playerNameColor,
  commonMeasurements.playerIcon,
  commonMeasurements.playerTrophies,
  commonMeasurements.playerHighestTrophies,
  commonMeasurements.powerPlayPoints,
  commonMeasurements.highestPowerPlayPoints,
  commonMeasurements.expPoints,
  // commonMeasurements.championshipQualified,
  commonMeasurements.victories,
  commonMeasurements.soloVictories,
  commonMeasurements.duoVictories,
  // commonMeasurements.roboRumble,
  // commonMeasurements.bigBrawler,
  commonMeasurements.brawlers,
  // commonMeasurements.clubId,
  // commonMeasurements.clubTag,
  commonMeasurements.clubName,

  // commonMeasurements.brawlerId,
  commonMeasurements.brawler,
  commonMeasurements.power,
  commonMeasurements.trophies,
  commonMeasurements.highestTrophies,
  commonMeasurements.starpowers,
  commonMeasurements.gadgets,
]

const playerBrawlerSlices = [
  commonSlices.playerId,
  commonSlices.playerName,
  commonSlices.season,
  commonSlices.seasonExact,
  commonSlices.trophyRangeGte,
  commonSlices.trophyRangeLt,
  commonSlices.brawlerId,
  commonSlices.brawler,
  commonSlices.powerGte,
  commonSlices.powerLte,
]

const playerBrawlerDefaultSliceValues = {
  playerId: [],
  playerName: [],
  season: [getSeasonEnd(monthAgo).toISOString().slice(0, 10)],
  trophies: [],
  brawlerId: [],
  brawlerName: [],
}

const cubes: Record<string, Cube> = {
  map: {
    id: 'map',
    table: 'map_meta',
    name: 'Map',
    dimensions: [
      ...brawlerBattleDimensions,
      commonDimensions.mode,
      commonDimensions.map,
      commonDimensions.powerplay,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...brawlerBattleMeasurements,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaMeasurements: ['picks', 'timestamp'],
    slices: [
      ...brawlerBattleSlices,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.id,
      commonSlices.mapLike,
      commonSlices.mapNotLike,
      commonSlices.powerplay,
    ],
    defaultSliceValues: {
      ...brawlerBattleDefaultSliceValues,
      mode: [],
      map: [],
      mapLike: [],
      mapNotLike: [],
      powerplay: ['false'],
    },
  },
  starpower: {
    id: 'starpower',
    table: 'starpower_meta',
    name: 'Star Power',
    dimensions: [
      ...brawlerBattleDimensions,
      commonDimensions.brawlerId,
      commonDimensions.starpower,
    ],
    defaultDimensionsIds: ['brawler', 'starpower'],
    measurements: [
      ...brawlerBattleMeasurements,
      commonMeasurements.starpowerName,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaMeasurements: ['picks', 'timestamp'],
    slices: [
      ...brawlerBattleSlices,
      commonSlices.starpowerIdEq,
      commonSlices.starpowerIdNeq,
    ],
    defaultSliceValues: {
      ...brawlerBattleDefaultSliceValues,
      starpowerIdNeq: ['0'],
    },
  },
  gadget: {
    id: 'gadget',
    table: 'gadget_meta',
    name: 'Gadget',
    dimensions: [
      ...brawlerBattleDimensions,
      commonDimensions.brawlerId,
      commonDimensions.gadget,
    ],
    defaultDimensionsIds: ['brawler', 'gadget'],
    measurements: [
      ...brawlerBattleMeasurements,
      commonMeasurements.gadgetName,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaMeasurements: ['picks', 'timestamp'],
    slices: [
      ...brawlerBattleSlices,
      commonSlices.gadgetIdEq,
      commonSlices.gadgetIdNeq,
    ],
    defaultSliceValues: {
      ...brawlerBattleDefaultSliceValues,
      gadgetIdNeq: ['0'],
    },
  },
  synergy: {
    id: 'synergy',
    table: 'synergy_meta',
    name: 'Synergies',
    dimensions: [
      ...brawlerBattleDimensions,
      commonDimensions.brawlerId,
      commonDimensions.ally,
      commonDimensions.allyId,
      commonDimensions.mode,
      commonDimensions.map,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...brawlerBattleMeasurements,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaMeasurements: ['picks', 'timestamp'],
    slices: [
      ...brawlerBattleSlices,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.brawlerId,
      commonSlices.ally,
      commonSlices.allyId,
    ],
    defaultSliceValues: {
      ...brawlerBattleDefaultSliceValues,
      mode: [],
      map: [],
      ally: [],
    },
  },
  player: {
    id: 'leaderboard',
    table: 'leaderboard',
    name: 'Leaderboard',
    hidden: true,
    dimensions: [
      commonDimensions.player,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      commonMeasurements.timestamp,
      commonMeasurements.playerName,
      commonMeasurements.playerIcon,
      commonMeasurements.expPoints,
      commonMeasurements.victories,
      commonMeasurements.soloVictories,
      commonMeasurements.duoVictories,
    ],
    defaultMeasurementIds: ['victories'],
    metaMeasurements: ['timestamp'],
    slices: [
      commonSlices.timestamp,
    ],
    defaultSliceValues: {
      timestamp: [],
    },
  },
  player_brawler: {
    id: 'player_brawler',
    table: 'brawler_leaderboard',
    name: 'Brawler Leaderboard',
    dimensions: [
      commonDimensions.player,
      commonDimensions.brawlerId,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      commonMeasurements.playerName,
      commonMeasurements.playerIcon,
      commonMeasurements.brawler,
      commonMeasurements.highestTrophies,
    ],
    defaultMeasurementIds: ['highestTrophies'],
    metaMeasurements: ['timestamp'],
    slices: [
      commonSlices.timestamp,
    ],
    defaultSliceValues: {
      timestamp: [],
    },
  },
  brawler: {
    id: 'brawler',
    table: 'brawler',
    name: 'Raw Brawlers',
    hidden: true,
    dimensions: [
      ...playerBrawlerDimensions,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      ...playerBrawlerMeasurements,
    ],
    defaultMeasurementIds: ['picks'],
    metaMeasurements: ['timestamp'],
    slices: [
      ...playerBrawlerSlices,
    ],
    defaultSliceValues: {
      ...playerBrawlerDefaultSliceValues,
    },
  },
  battle: {
    id: 'battle',
    table: 'battle',
    name: 'Raw Battles',
    hidden: true,
    dimensions: [
      ...playerBrawlerDimensions,
      battleDimensions.mode,
      battleDimensions.map,
      battleDimensions.powerplay,
      battleDimensions.team,
      battleDimensions.teamSize,
      brawlerDimensions.starpower,
      brawlerDimensions.gadget,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      ...playerBrawlerMeasurements,
      battleNumberMeasurements.wins,
      battleNumberMeasurements.duration,
      battleNumberMeasurements.rank,
      battleNumberMeasurements.rank1,
      battleNumberMeasurements.trophyChange,
      battleNumberMeasurements.winRate,
      battleNumberMeasurements.winRateAdj,
      battleNumberMeasurements.starRate,
      battleStringMeasurements.starpowerName,
      battleStringMeasurements.gadgetName,
      // TODO
    ],
    defaultMeasurementIds: ['picks'],
    metaMeasurements: ['timestamp', 'picks'],
    slices: [
      ...playerBrawlerSlices,
      commonSlices.mode,
      commonSlices.teamSizeGt,
      commonSlices.teamContains,
      commonSlices.map,
      commonSlices.powerplay,
      brawlerSlices.starpowerIdEq,
      brawlerSlices.starpowerIdNeq,
      brawlerSlices.gadgetIdEq,
      brawlerSlices.gadgetIdNeq,
    ],
    defaultSliceValues: {
      ...playerBrawlerDefaultSliceValues,
      mode: [],
      map: [],
      powerplay: [],
    },
  },
}

export default cubes
