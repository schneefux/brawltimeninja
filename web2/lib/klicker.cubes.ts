import { asSlice, Cube, MetaGridEntry, Dimension, Metric } from "@schneefux/klicker/types"
// @ts-ignore
import { ChiSquared } from 'sampson' // TODO does not treeshake - unfortunately, sampson is written in Flow
import { formatClickhouseDate } from "./util"

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
const monthAgoSeason = formatClickhouseDate(getSeasonEnd(monthAgo))

/**
 * Calculate $m.useRate / sum($m.useRate over all dimensions except brawler)
 */
function percentageOver(metricId: string, overDimension: Dimension) {
  const rowIdWithout = (row: MetaGridEntry) =>
    row.id.replace(`${overDimension.id}=${row.dimensionsRaw[overDimension.id][overDimension.naturalIdAttribute]};`, '')

  return (entries: MetaGridEntry[]) => {
    if (entries.length == 0 || !(overDimension.id in entries[0].dimensionsRaw)) {
      return entries.map(row => row.metricsRaw[metricId] as number)
    }

    const total: Record<string, number> = {}
    entries.forEach((row) => {
      const key = rowIdWithout(row)

      if (!(key in total)) {
        total[key] = 0
      }

      total[key] += row.metricsRaw[metricId] as number
    })

    return entries.map(row => {
      const key = rowIdWithout(row)
      return row.metricsRaw[metricId] as number / total[key]
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

function binomialTest(getK: (d: MetaGridEntry['metricsRaw']) => number, getN: (d: MetaGridEntry['metricsRaw']) => number) {
  // approximate a binomial test using the G-test
  return (r: MetaGridEntry['metricsRaw'], t: MetaGridEntry['metricsRaw']) => {
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

    // @ts-ignore
    return ChiSquared.pdf(g, {
      // df: (rows - 1) * (columns - 1)
      df: 1
    })
  }
}

function binomialCI(getK: (d: MetaGridEntry['metricsRaw']) => number, getN: (d: MetaGridEntry['metricsRaw']) => number) {
  // 95% Wilson score interval
  return (d: MetaGridEntry['metricsRaw']) => {
    const z = 1.96

    const n = getN(d)
    const ns = getK(d)
    const nf = n - ns
    const z2 = Math.pow(z, 2)

    const base = (ns + 0.5*z2) / (n + z2)
    const diff = z/(n + z2) * Math.sqrt( (ns*nf)/n + z2/4 )

    return {
      lower: Math.max(0.0, base - diff),
      mean: (ns + 2) / (n + 4),
      upper: Math.min(1.0, base + diff),
    }
  }
}


// TODO get standard deviations and implement t test for non-binomial attributes

const seasonDimension: Dimension = {
  id: 'season',
  name: 'Bi-Week',
  childIds: ['day', 'timestamp'],
  naturalIdAttribute: 'season',
  formatter: 'yyyy-MM-dd',
  additionalMetrics: [],
  type: 'temporal',
  scale: {
    nice: 'week',
  },
  config: {
    sql: 'trophy_season_end',
    type: 'time',
  },
}

const dayDimension: Dimension = {
  id: 'day',
  name: 'Day',
  childIds: ['timestamp'],
  naturalIdAttribute: 'day',
  formatter: 'yyyy-MM-dd',
  additionalMetrics: [],
  type: 'temporal',
  scale: {
    nice: 'day',
  },
  config: {
    sql: 'toStartOfDay(timestamp)',
    type: 'time',
  },
}

const timestampDimension: Dimension = {
  id: 'timestamp',
  name: 'Timestamp',
  naturalIdAttribute: 'timestamp',
  formatter: 'yyyy-MM-ddTHH:mm',
  additionalMetrics: [],
  type: 'temporal',
  scale: {
    nice: 'hour',
  },
  config: {
    sql: 'timestamp',
    type: 'time',
  },
}

const playerDimension: Dimension = {
  id: 'player',
  name: 'Player',
  naturalIdAttribute: 'playerName',
  additionalMetrics: ['playerName', 'playerIcon'],
  type: 'nominal',
  config: {
    sql: 'player_id',
    type: 'string',
  },
}


const allyIdDimension: Dimension = {
  id: 'allyId',
  name: 'Ally ID',
  childIds: ['ally'],
  naturalIdAttribute: 'allyId',
  additionalMetrics: [],
  hidden: true,
  type: 'nominal',
  config: {
    sql: 'ally_brawler_id',
    type: 'string',
  },
}

const allyDimension: Dimension = {
  id: 'ally',
  name: 'Ally',
  naturalIdAttribute: 'ally',
  formatter: 'capitalizeWords',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'ally_brawler_name',
    type: 'string',
  },
}

const enemyIdDimension: Dimension = {
  id: 'enemyId',
  name: 'Enemy ID',
  childIds: ['enemy'],
  naturalIdAttribute: 'enemyId',
  additionalMetrics: [],
  hidden: true,
  type: 'nominal',
  config: {
    sql: 'enemy_brawler_id',
    type: 'string',
  },
}

const enemyDimension: Dimension = {
  id: 'enemy',
  name: 'Enemery',
  naturalIdAttribute: 'enemy',
  formatter: 'capitalizeWords',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'enemy_brawler_name',
    type: 'string',
  },
}

const brawlerDimension: Dimension = {
  id: 'brawler',
  name: 'Brawler',
  childIds: ['gadget', 'starpower', 'gear'],
  naturalIdAttribute: 'brawler',
  formatter: 'capitalizeWords',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'brawler_name',
    type: 'string',
  },
}

const brawlerIdDimension: Dimension = {
  id: 'brawlerId',
  name: 'Brawler ID',
  childIds: ['brawler', 'gadget', 'starpower', 'gear'],
  naturalIdAttribute: 'brawlerId',
  additionalMetrics: [],
  hidden: true,
  type: 'nominal',
  config: {
    sql: 'brawler_id',
    type: 'string',
  },
}

const gadgetDimension: Dimension = {
  id: 'gadget',
  name: 'Gadget',
  naturalIdAttribute: 'gadgetName',
  formatter: 'capitalizeWords',
  additionalMetrics: ['gadgetName', 'brawler'],
  type: 'nominal',
  config: {
    sql: 'brawler_gadget_id',
    type: 'string',
  },
}

const starpowerDimension: Dimension = {
  id: 'starpower',
  name: 'Star Power',
  naturalIdAttribute: 'starpowerName',
  formatter: 'capitalizeWords',
  additionalMetrics: ['starpowerName', 'brawler'],
  type: 'nominal',
  config: {
    sql: 'brawler_starpower_id',
    type: 'string',
  },
}

const gearDimension: Dimension = {
  id: 'gear',
  name: 'Gear',
  naturalIdAttribute: 'gearName',
  formatter: 'capitalizeWords',
  additionalMetrics: ['gearName'],
  type: 'nominal',
  config: {
    sql: 'brawler_gear_id',
    type: 'string',
  },
}

const starpowersLengthDimension: Dimension = {
  id: 'starpowersLength',
  name: 'Star Powers owned',
  naturalIdAttribute: 'starpowerLength',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'brawler_starpowers_length',
    type: 'string',
  },
}

const gadgetsLengthDimension: Dimension = {
  id: 'gadgetsLength',
  name: 'Gadgets owned',
  naturalIdAttribute: 'gadgetLength',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'brawler_gadgets_length',
    type: 'string',
  },
}

const gearsLengthDimension: Dimension = {
  id: 'gearsLength',
  name: 'Gears owned',
  naturalIdAttribute: 'gearsLength',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'brawler_gears_length',
    type: 'string',
  },
}

const bigbrawlerDimension: Dimension = {
  id: 'bigbrawler',
  name: 'Big Brawler',
  naturalIdAttribute: 'bigbrawler',
  formatter: 'y/n',
  additionalMetrics: [],
  hidden: true,
  type: 'nominal',
  config: {
    sql: 'battle_is_bigbrawler',
    type: 'boolean',
  },
}

const trophyRangeDimension: Dimension = {
  id: 'trophyRange',
  name: 'Trophy Range',
  naturalIdAttribute: 'trophyRange',
  additionalMetrics: [],
  hidden: true,
  type: 'ordinal',
  formatter: 'trophyRange',
  config: {
    sql: 'brawler_trophyrange',
    type: 'string',
  },
}

const modeDimension: Dimension = {
  id: 'mode',
  name: 'Mode',
  childIds: ['map'],
  naturalIdAttribute: 'mode',
  formatter: 'formatMode',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'battle_event_mode',
    type: 'string',
  },
}

const mapDimension: Dimension = {
  id: 'map',
  name: 'Map',
  naturalIdAttribute: 'map',
  additionalMetrics: ['mode', 'eventId'],
  type: 'nominal',
  config: {
    sql: 'battle_event_map',
    type: 'string',
  },
}

const teamDimension: Dimension = {
  id: 'team',
  name: 'Team',
  naturalIdAttribute: 'team',
  formatter: 'capitalizeWords',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name]))',
    type: 'string',
  },
}

const teamSizeDimension: Dimension = {
  id: 'teamSize',
  name: 'Team size',
  childIds: ['team'],
  naturalIdAttribute: 'team',
  additionalMetrics: [],
  hidden: true,
  type: 'quantitative',
  config: {
    sql: 'length(battle_allies.brawler_name) + 1',
    type: 'number',
  },
}

const powerplayDimension: Dimension = {
  id: 'powerplay',
  name: 'Power Play',
  naturalIdAttribute: 'powerplay',
  formatter: 'y/n',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'battle_event_powerplay',
    type: 'boolean',
  },
}

const powerDimension: Dimension = {
  id: 'power',
  name: 'Power',
  naturalIdAttribute: 'power',
  formatter: '.2f',
  additionalMetrics: [],
  type: 'quantitative',
  config: {
    sql: 'brawler_power',
    type: 'number',
  },
}

const picks = 'SUM(picks)'
const winRate = `toFloat64(AVG(battle_victory))`
const zP = 'least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)'

const winRateMerged = `toFloat64(avgMerge(battle_victory_state))`
const winratePosteriorMerged = `(1583+${winRateMerged}*${picks})/(1583/${zP}+${picks})`

const picksRaw = 'COUNT()'
const winratePosteriorRaw = `(1583+${winRate}*${picksRaw})/(1583/${zP}+${picksRaw})`

const playerNameMetric: Metric = {
  id: 'playerName',
  name: 'Most common name',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(player_name)',
    type: 'number',
  },
}

const clubNameMetric: Metric = {
  id: 'clubName',
  name: 'Most common Club name',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(player_club_name)',
    type: 'number',
  },
}

const playerIconMetric: Metric = {
  id: 'playerIcon',
  name: 'Most common icon',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(player_icon_id)',
    type: 'number',
  },
}

const playerNameColorMetric: Metric = {
  id: 'playerNameColor',
  name: 'Most common color',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(player_name_color)',
    type: 'number',
  },
}

const playerTrophiesMetric: Metric = {
  id: 'playerTrophies',
  name: 'Player Trophies',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_trophies',
    type: 'max',
  },
}

const playerHighestTrophiesMetric: Metric = {
  id: 'playerHighestTrophies',
  name: 'Player Highest Trophies',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_highest_trophies',
    type: 'max',
  },
}

const victoriesMetric: Metric = {
  id: 'victories',
  name: '3v3 Victories',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_3vs3_victories',
    type: 'max',
  },
}

const soloVictoriesMetric: Metric = {
  id: 'soloVictories',
  name: 'Solo Victories',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_solo_victories',
    type: 'max',
  },
}

const duoVictoriesMetric: Metric = {
  id: 'duoVictories',
  name: 'Duo Victories',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_duo_victories',
    type: 'max',
  },
}

const usersMetric: Metric = {
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
}

const powerPlayPointsMetric: Metric = {
  id: 'powerPlayPoints',
  name: 'Power Play Points',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'player_power_play_points',
    type: 'max',
  },
}

const highestPowerPlayPointsMetric: Metric = {
  id: 'highestPowerPlayPoints',
  name: 'Highest Power Play Points',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'player_highest_power_play_points',
    type: 'max',
  },
}

const expLevelMetric: Metric = {
  id: 'expLevel',
  name: 'EXP Level',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'player_exp_level',
    type: 'max',
  },
}

const hoursMetric: Metric = {
  id: 'hours',
  name: 'Hours',
  sign: -1,
  type: 'quantitative',
  formatter: '.0f',
  d3formatter: '.0f',
  config: {
    sql: 'player_exp_points / 220',
    type: 'max',
  },
}

const expPointsMetric: Metric = {
  id: 'expPoints',
  name: 'EXP',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'player_exp_points',
    type: 'max',
  },
}

const brawlersMetric: Metric = {
  id: 'brawlers',
  name: 'Brawlers',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'player_brawlers_length',
    type: 'max',
  },
}

const brawlerMetric: Metric = {
  id: 'brawler',
  name: 'Most played Brawler',
  formatter: 'capitalizeWords',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'anyHeavy(brawler_name)',
    type: 'number',
  },
}

const highestTrophiesMetric: Metric = {
  id: 'highestTrophies',
  name: 'Highest Trophies',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'brawler_highest_trophies',
    type: 'max',
  },
}

export const trophiesMetric: Metric = {
  id: 'trophies',
  name: 'Trophies',
  description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'brawler_trophies',
    type: 'avg',
  },
}

const starpowersMetric: Metric = {
  id: 'starpowers',
  name: 'Star Powers',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'brawler_starpowers_length',
    type: 'max',
  },
}

const gadgetsMetric: Metric = {
  id: 'gadgets',
  name: 'Gadgets',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'brawler_gadgets_length',
    type: 'max',
  },
}

const gearsMetric: Metric = {
  id: 'gears',
  name: 'Gears',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'brawler_gears_length',
    type: 'max',
  },
}

const timestampMetric: Metric = {
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
}

const dayMetric: Metric = {
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
}

const trophyChangeMetric: Metric = {
  id: 'trophyChange',
  name: 'Trophy Change',
  formatter: '+.2f',
  d3formatter: '+.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'battle_trophy_change',
    type: 'avg',
  },
}

export const winRateAdjMetric: Metric = {
  id: 'winRateAdj',
  name: 'Adjusted Win Rate',
  description: 'For Brawlers with few picks, the Adjusted Win Rate is interpolated using a Bayesian Average.',
  formatter: '.1%',
  d3formatter: '.1%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: winratePosteriorRaw,
    type: 'number',
  },
}

const winsMetric: Metric = {
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
}

const winsZScoreMetric: Metric = {
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
}

export const picksMetric: Metric = {
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
}

const pickRateMetric: Metric = {
  id: 'pickRate',
  name: 'Pick Rate',
  description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: '',
    type: 'count',
  },
  transform: percentageOver('pickRate', brawlerDimension),
}

export const useRateMetric: Metric = {
  id: 'useRate',
  name: 'Use Rate',
  description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'player_brawlers_length',
    type: 'sum',
  },
  transform: percentageOver('useRate', brawlerDimension),
}

export const starRateMetric: Metric = {
  id: 'starRate',
  name: 'Star Player',
  description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
  formatter: '.1%',
  d3formatter: '.1%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'battle_is_starplayer',
    type: 'avg',
  },
  statistics: {
    test: {
      name: 'G-Test',
      test: binomialTest(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
  },
    ci: {
      ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
    },
  },
}

const rankMetric: Metric = {
  id: 'rank',
  name: 'Average Rank',
  description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
  formatter: '.2f',
  d3formatter: '.2f',
  sign: +1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'battle_rank',
    type: 'avg',
  },
}

const rank1Metric: Metric = {
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
}

const rank1RateMetric: Metric = {
  id: 'rank1Rate',
  name: '#1 Rate',
  description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'battle_rank1',
    type: 'avg',
  },
}

const durationMetric: Metric = {
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
}

const levelMetric: Metric = {
  id: 'level',
  name: 'Average Level',
  formatter: '.2f',
  d3formatter: '.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'battle_level',
    type: 'avg',
  },
}

const powerMetric: Metric = {
  id: 'power',
  name: 'Power',
  formatter: '.2f',
  d3formatter: '.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'brawler_power',
    type: 'avg',
  },
}

const starpowerNameMetric: Metric = {
  id: 'starpowerName',
  name: 'Star Power',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(brawler_starpower_name)',
    type: 'number',
  },
}

const gadgetNameMetric: Metric = {
  id: 'gadgetName',
  name: 'Gadget',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(brawler_gadget_name)',
    type: 'number',
  },
}

const gearNameMetric: Metric = {
  id: 'gearName',
  name: 'Gear',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(brawler_gear_name)',
    type: 'number',
  },
}

const eventIdMetric: Metric = {
  id: 'eventId',
  name: 'Event ID',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(battle_event_id)',
    type: 'number',
  },
}

const mapMetric: Metric = {
  id: 'map',
  name: 'Map',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(battle_event_map)',
    type: 'number',
  },
}

const modeMetric: Metric = {
  id: 'mode',
  name: 'Mode',
  sign: -1,
  type: 'nominal',
  config: {
    sql: 'any(battle_event_mode)',
    type: 'number',
  },
}

// same as battleMetrics, but using clickhouse merge for mv
const timestampMergedMetric: Metric = {
  id: 'timestamp',
  name: 'Last Update',
  formatter: 'yyyy-MM-ddTHH:mm',
  sign: -1,
  type: 'temporal',
  config: {
    sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
    type: 'number',
  },
}

const picksMergedMetric: Metric = {
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
}

const trophyChangeMergedMetric: Metric = {
  id: 'trophyChange',
  name: 'Trophy Change',
  formatter: '+.2f',
  d3formatter: '+.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_trophy_change_state)',
    type: 'number',
  },
}

const makeWinRateMetric = (config: Metric['config']): Metric => {
  return {
    id: 'winRate',
    name: 'Win Rate',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    vega: {
      scale: {
        zero: false,
      },
    },
    config,
    statistics: {
      test: {
        name: 'G-Test',
        test: binomialTest(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMetrics: ['picks'],
      },
      ci: {
        ci: binomialCI(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMetrics: ['picks'],
      },
    },
  }
}

const winRateMergedMetric = makeWinRateMetric({
  sql: 'avgMerge(battle_victory_state)',
  type: 'number',
})

const winRateSumMergedMetric = makeWinRateMetric({
  sql: 'sum(battle_victory) / sum(picks)',
  type: 'number',
})

export const winRateMetric = makeWinRateMetric({
  sql: 'battle_victory',
  type: 'avg',
})

const winRateAdjMergedMetric: Metric = {
  id: 'winRateAdj',
  name: 'Adjusted Win Rate',
  description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
  formatter: '.1%',
  d3formatter: '.1%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: winratePosteriorMerged,
    type: 'number',
  },
}

const winsMergedMetric: Metric = {
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
}

const pickRateMergedMetric: Metric = {
  id: 'pickRate',
  name: 'Pick Rate',
  description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'SUM(picks)',
    type: 'number',
  },
  transform: percentageOver('pickRate', brawlerDimension),
}

const useRateMergedMetric: Metric = {
  id: 'useRate',
  name: 'Use Rate',
  description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'picks_weighted',
    type: 'sum',
  },
  transform: percentageOver('useRate', brawlerDimension),
}

const starRateMergedMetric: Metric = {
  id: 'starRate',
  name: 'Star Player',
  description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
  formatter: '.1%',
  d3formatter: '.1%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_starplayer_state)',
    type: 'number',
  },
  statistics: {
    test: {
      name: 'G-Test',
      test: binomialTest(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
  },
    ci: {
      ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
    },
  },
}

const rankMergedMetric: Metric = {
  id: 'rank',
  name: 'Average Rank',
  description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
  formatter: '.2f',
  d3formatter: '.2f',
  sign: +1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_rank_state)',
    type: 'number',
  },
}

const rank1RateMergedMetric: Metric = {
  id: 'rank1Rate',
  name: '#1 Rate',
  description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
  formatter: '.2%',
  d3formatter: '.2%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_rank1_state)',
    type: 'number',
  },
  statistics: {
    test: {
      name: 'G-Test',
      test: binomialTest(m => (m['rank1Rate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
    },
    ci: {
      ci: binomialCI(m => (m['rank1Rate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
    },
  },
}

const durationMergedMetric: Metric = {
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
}

const levelMergedMetric: Metric = {
  id: 'level',
  name: 'Average Level',
  formatter: '.2f',
  d3formatter: '.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_level_state)',
    type: 'number',
  },
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
  notBrawler: {
    id: 'notBrawler',
    config: {
      member: 'brawler_dimension',
      operator: 'notEquals',
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
  enemy: {
    id: 'enemy',
    config: {
      member: 'enemy_brawler_dimension',
      operator: 'equals',
    },
  },
  enemyId: {
    id: 'enemyId',
    config: {
      member: 'enemy_brawler_id_dimension',
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
      member: 'power_dimension',
      operator: 'gte',
    },
  },
  powerLte: {
    id: 'powerLte',
    config: {
      member: 'power_dimension',
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
  starpowersLength: {
    id: 'starpowersLength',
    config: {
      member: 'starpowersLength_dimension',
      operator: 'equals',
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
  gadgetsLength: {
    id: 'gadgetsLength',
    config: {
      member: 'gadgetsLength_dimension',
      operator: 'equals',
    },
  },
  gearIdEq: {
    id: 'gearIdEq',
    config: {
      member: 'gear_dimension',
      operator: 'equals',
    },
  },
  gearIdNeq: {
    id: 'gearIdNeq',
    config: {
      member: 'gear_dimension',
      operator: 'notEquals',
    },
  },
  gearsLength: {
    id: 'gearsLength',
    config: {
      member: 'gearsLength_dimension',
      operator: 'equals',
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

const brawlerBattleMetrics = [
  /*
  mergedbattleMetrics.trophySeasonEnd,
  */
  modeMetric,
  mapMetric,
  eventIdMetric,
  timestampMergedMetric,
  trophyChangeMergedMetric,
  winRateMergedMetric,
  winRateAdjMergedMetric,
  winsMergedMetric,
  picksMergedMetric,
  pickRateMergedMetric,
  useRateMergedMetric,
  starRateMergedMetric,
  rankMergedMetric,
  rank1RateMergedMetric,
  durationMergedMetric,
  levelMergedMetric,
  brawlerMetric,
]

const brawlerBattleDimensions = [
  brawlerDimension,
  seasonDimension,
  trophyRangeDimension,
]

const brawlerBattleSlices = [
  commonSlices.season,
  commonSlices.seasonExact,
  commonSlices.trophyRangeGte,
  commonSlices.trophyRangeLt,
  commonSlices.brawler,
  commonSlices.notBrawler,
]

const playerBrawlerDimensions = [
  seasonDimension,
  timestampDimension,
  dayDimension,
  playerDimension,
  brawlerDimension,
  brawlerIdDimension,
  trophyRangeDimension,
  powerDimension,
]

const playerBrawlerMetrics = [
  picksMetric,
  pickRateMetric,
  useRateMetric,
  usersMetric,
  // commonMetrics.season,
  timestampMetric,
  dayMetric,
  playerNameMetric,
  playerNameColorMetric,
  playerIconMetric,
  playerTrophiesMetric,
  playerHighestTrophiesMetric,
  powerPlayPointsMetric,
  highestPowerPlayPointsMetric,
  expPointsMetric,
  // commonMetrics.championshipQualified,
  victoriesMetric,
  soloVictoriesMetric,
  duoVictoriesMetric,
  // commonMetrics.roboRumble,
  // commonMetrics.bigBrawler,
  brawlersMetric,
  // commonMetrics.clubId,
  // commonMetrics.clubTag,
  clubNameMetric,

  // commonMetrics.brawlerId,
  brawlerMetric,
  powerMetric,
  trophiesMetric,
  highestTrophiesMetric,
  starpowersMetric,
  gadgetsMetric,
  gearsMetric,
  hoursMetric,
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
  commonSlices.notBrawler,
  commonSlices.powerGte,
  commonSlices.powerLte,
]

const mapCube: Cube = {
  id: 'map',
  table: 'map_meta',
  name: 'Map',
  dimensions: [
    ...brawlerBattleDimensions,
    modeDimension,
    mapDimension,
    powerplayDimension,
  ],
  defaultDimensionsIds: ['brawler'],
  metrics: [
    ...brawlerBattleMetrics,
  ],
  defaultMetricIds: ['winRateAdj'],
  metaMetrics: ['picks', 'timestamp'],
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
    season: [monthAgoSeason],
  },
}

const starpowerCube: Cube = {
  id: 'starpower',
  table: 'starpower_meta',
  name: 'Star Power',
  dimensions: [
    ...brawlerBattleDimensions,
    brawlerIdDimension,
    starpowerDimension,
  ],
  defaultDimensionsIds: ['brawler', 'starpower'],
  metrics: [
    ...brawlerBattleMetrics,
    starpowerNameMetric,
  ],
  defaultMetricIds: ['winRateAdj'],
  metaMetrics: ['picks', 'timestamp'],
  slices: [
    ...brawlerBattleSlices,
    commonSlices.starpowerIdEq,
    commonSlices.starpowerIdNeq,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const gadgetCube: Cube = {
  id: 'gadget',
  table: 'gadget_meta',
  name: 'Gadget',
  dimensions: [
    ...brawlerBattleDimensions,
    brawlerIdDimension,
    gadgetDimension,
  ],
  defaultDimensionsIds: ['brawler', 'gadget'],
  metrics: [
    ...brawlerBattleMetrics,
    gadgetNameMetric,
  ],
  defaultMetricIds: ['winRateAdj'],
  metaMetrics: ['picks', 'timestamp'],
  slices: [
    ...brawlerBattleSlices,
    commonSlices.gadgetIdEq,
    commonSlices.gadgetIdNeq,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const brawlerAlliesCube: Cube = {
  id: 'brawlerAllies',
  table: 'brawler_allies_mv',
  name: 'Synergies',
  dimensions: [
    ...brawlerBattleDimensions,
    brawlerIdDimension,
    allyDimension,
    allyIdDimension,
    modeDimension,
    mapDimension,
  ],
  defaultDimensionsIds: ['brawler'],
  metrics: [
    winRateSumMergedMetric,
    picksMergedMetric,
  ],
  defaultMetricIds: ['winRateAdj'],
  metaMetrics: ['picks', 'timestamp'],
  slices: [
    ...brawlerBattleSlices,
    commonSlices.mode,
    commonSlices.map,
    commonSlices.brawlerId,
    commonSlices.ally,
    commonSlices.allyId,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const brawlerEnemiesCube: Cube = {
  id: 'brawlerEnemies',
  table: 'brawler_enemies_mv',
  name: 'Weaknesses',
  dimensions: [
    ...brawlerBattleDimensions,
    brawlerIdDimension,
    enemyDimension,
    enemyIdDimension,
    modeDimension,
    mapDimension,
  ],
  defaultDimensionsIds: ['brawler'],
  metrics: [
    winRateSumMergedMetric,
    picksMergedMetric,
  ],
  defaultMetricIds: ['winRateAdj'],
  metaMetrics: ['picks', 'timestamp'],
  slices: [
    ...brawlerBattleSlices,
    commonSlices.mode,
    commonSlices.map,
    commonSlices.brawlerId,
    commonSlices.enemy,
    commonSlices.enemyId,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const battleCube: Cube = {
  id: 'battle',
  table: 'battle',
  name: 'Battles',
  dimensions: [
    ...playerBrawlerDimensions,
    modeDimension,
    mapDimension,
    powerplayDimension,
    teamDimension,
    teamSizeDimension,
    starpowerDimension,
    starpowersLengthDimension,
    gadgetDimension,
    gadgetsLengthDimension,
    gearDimension,
    gearsLengthDimension,
  ],
  defaultDimensionsIds: ['player'],
  metrics: [
    ...playerBrawlerMetrics,
    winsMetric,
    durationMetric,
    rankMetric,
    rank1Metric,
    trophyChangeMetric,
    winRateMetric,
    winRateAdjMetric,
    starRateMetric,
    starpowerNameMetric,
    gadgetNameMetric,
    gearNameMetric,
    // TODO
  ],
  defaultMetricIds: ['picks'],
  metaMetrics: ['timestamp', 'picks'],
  slices: [
    ...playerBrawlerSlices,
    commonSlices.mode,
    commonSlices.teamSizeGt,
    commonSlices.teamContains,
    commonSlices.map,
    commonSlices.mapLike,
    commonSlices.mapNotLike,
    commonSlices.powerplay,
    brawlerSlices.starpowerIdEq,
    brawlerSlices.starpowerIdNeq,
    brawlerSlices.starpowersLength,
    brawlerSlices.gadgetIdEq,
    brawlerSlices.gadgetIdNeq,
    brawlerSlices.gadgetsLength,
    brawlerSlices.gearIdEq,
    brawlerSlices.gearIdNeq,
    brawlerSlices.gearsLength,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const brawlerCube: Cube = {
  id: 'brawler',
  table: 'brawler',
  name: 'Raw Brawlers',
  dimensions: [
    ...playerBrawlerDimensions,
  ],
  defaultDimensionsIds: ['player'],
  metrics: [
    ...playerBrawlerMetrics,
  ],
  defaultMetricIds: ['picks'],
  metaMetrics: ['timestamp'],
  slices: [
    ...playerBrawlerSlices,
  ],
  defaultSliceValues: {
    season: [monthAgoSeason],
  },
}

const cubes: Record<string, Cube> = {
  brawler: brawlerCube,
  battle: battleCube,
  // the queries for these are slightly different from battle, so they are no materializations
  map: mapCube, // takes allies into account for the statistics
  gadget: gadgetCube, // excludes 0 gadgets
  starpower: starpowerCube, // excludes 0 starpowers
  brawlerAllies: brawlerAlliesCube, // joins allies
  brawlerEnemies: brawlerEnemiesCube, // joins enemies
}

export default cubes
