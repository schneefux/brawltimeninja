export interface Config extends Record<string, Cube> {}

// helper function which infers keys and restricts values to ElementType
const asDimensions = <T>(et: { [K in keyof T]: Dimension }) => et
const asMeasurements = <T>(et: { [K in keyof T]: Measurement }) => et
const asSlice = <T>(et: { [K in keyof T]: Slice }) => et

export type ValueType = 'quantitative'|'temporal'|'ordinal'|'nominal'
export type MeasureType = 'number'|'count'|'countDistinct'|'countDistinctApprox'|'sum'|'avg'|'min'|'max'|'runningTotal'
export type DimensionType = 'time'|'string'|'number'|'boolean'|'geo'
export type OperatorType = 'equals'|'notEquals'|'contains'|'notContains'|'gt'|'gte'|'lt'|'lte'|'set'|'notSet'|'inDateRange'|'notInDateRange'|'beforeDate'|'afterDate'
export type FormatType = 'duration'|'y/n'|'formatMode'|string // or date format or d3-format spec

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

export interface State {
  cubeId: string
  slices: SliceValue
  comparingSlices?: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
  sortId: string
}

export interface Cube {
  id: string
  table: string
  name: string
  hidden: boolean
  dimensions: Dimension[]
  defaultDimensionsIds: string[]
  measurements: Measurement[]
  defaultMeasurementIds: string[]
  slices: Slice[]
  defaultSliceValues: SliceValue
  /**
   * deprecate
   */
  // ids
  metaMeasurements: string[]
}

/**
 * Measure which will be transformed into a cube.js measure
 * with id `${id}_measure`.
 */
export interface Measurement {
  id: string
  name: string
  description: string
  formatter: string
  d3formatter: string
  sign: number
  percentageOver?: string // dimension id
  type: ValueType
  /**
   * Vega.js scale configuration
   * @see https://vega.github.io/vega-lite/docs/scale.html
   */
  scale?: any
  /**
   * cube.js configuration.
   */
  config: {
    sql: string
    type: MeasureType
  }
  /**
   * old attributes, deprecate
   */
  icon: string
  column: string
}

/**
 * Dimension which will be transformed into a cube.js dimension
 * with id `${id}_dimension`.
 */
export interface Dimension {
  id: string
  name: string
  /**
   * Column which contains a human-readable identifier.
   * May be the dimension or one of additionalMeasures.
   */
  naturalIdAttribute: string
  /**
   * Specification to use for formatting the natural ID.
   */
  formatter: FormatType
  /**
   * Measures to always request when requesting dimension.
   * Used for attributes of SCDs.
   */
  additionalMeasures: string[]
  hidden: boolean
  type: ValueType
  /**
   * Vega.js scale configuration
   * @see https://vega.github.io/vega-lite/docs/scale.html
   */
  scale?: any
  /**
   * cube.js configuration.
   */
  config: {
    sql: string
    type: DimensionType
  }
  /**
   * Deprecated clicker configuration
   */
  column: string
}

export interface Slice {
  id: string
  name: string
  column: string
  config: { // cube.js config
    member: string // dimension/measure id
    operator: OperatorType
  }
  // TODO: for description
  // formatter: string
}

export interface SliceValue extends Record<string, string[]> { }

const metaDimensions = asDimensions({
  season: {
    id: 'season',
    name: 'Bi-Week',
    naturalIdAttribute: 'season',
    formatter: 'yyyy-MM-dd',
    column: 'trophy_season_end',
    additionalMeasures: [],
    hidden: false,
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
    naturalIdAttribute: 'day',
    formatter: 'yyyy-MM-dd',
    column: '',
    additionalMeasures: [],
    hidden: false,
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
    column: 'timestamp',
    additionalMeasures: [],
    hidden: false,
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
    formatter: '',
    column: 'player_id',
    additionalMeasures: ['playerName', 'playerIcon'],
    hidden: false,
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
    naturalIdAttribute: 'brawler',
    formatter: 'capitalizeWords',
    column: 'brawler_name',
    additionalMeasures: [],
    hidden: false,
    type: 'nominal',
    config: {
      sql: 'brawler_name',
      type: 'string',
    },
  },
  brawlerId: {
    id: 'brawlerId',
    name: 'Brawler ID',
    naturalIdAttribute: 'brawlerId',
    formatter: '',
    column: 'brawler_id',
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
    column: 'ally_brawler_name',
    additionalMeasures: [],
    hidden: false,
    type: 'nominal',
    config: {
      sql: 'ally_brawler_name',
      type: 'string',
    },
  },
  allyId: {
    id: 'allyId',
    name: 'Ally ID',
    naturalIdAttribute: 'allyId',
    formatter: '',
    column: 'ally_brawler_id',
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
    column: 'brawler_gadget_id',
    additionalMeasures: ['gadgetName', 'brawler'],
    hidden: false,
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
    column: 'brawler_starpower_id',
    additionalMeasures: ['starpowerName', 'brawler'],
    hidden: false,
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
    column: 'brawler_is_bigbrawler',
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
    formatter: '',
    column: 'brawler_trophyrange',
    additionalMeasures: [],
    hidden: true,
    type: 'ordinal',
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
    naturalIdAttribute: 'mode',
    formatter: 'formatMode',
    column: 'battle_event_mode',
    additionalMeasures: [],
    hidden: false,
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
    formatter: '',
    column: 'battle_event_map',
    additionalMeasures: ['mode', 'eventId'],
    hidden: false,
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
    column: '',
    additionalMeasures: [],
    hidden: false,
    type: 'nominal',
    config: {
      sql: 'arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name]))',
      type: 'string',
    },
  },
  powerplay: {
    id: 'powerplay',
    name: 'Power Play',
    naturalIdAttribute: 'powerplay',
    formatter: 'y/n',
    column: 'battle_event_powerplay',
    additionalMeasures: [],
    hidden: false,
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

export const playerMeasurements = asMeasurements({
  playerName: {
    id: 'playerName',
    name: 'Most common name',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_name',
    type: 'nominal',
    config: {
      sql: 'any(player_name)',
      type: 'number',
    },
  },
  clubName: {
    id: 'clubName',
    name: 'Most common Club name',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_club_name',
    type: 'nominal',
    config: {
      sql: 'any(player_club_name)',
      type: 'number',
    },
  },
  playerIcon: {
    id: 'playerIcon',
    name: 'Most common icon',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_icon_id',
    type: 'nominal',
    config: {
      sql: 'any(player_icon_id)',
      type: 'number',
    },
  },
  playerNameColor: {
    id: 'playerNameColor',
    name: 'Most common color',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_name_color',
    type: 'nominal',
    config: {
      sql: 'any(player_name_color)',
      type: 'number',
    },
  },
  playerTrophies: {
    id: 'playerTrophies',
    name: 'Player Trophies',
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_trophies',
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
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_highest_trophies',
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
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_3vs3_victories',
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
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_exp_points',
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
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_solo_victories',
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
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'player_duo_victories',
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
    icon: '🧑',
    description: 'The total number of players.',
    formatter: '.1s',
    d3formatter: '.1s',
    sign: -1,
    column: 'users',
    type: 'quantitative',
    config: {
      sql: 'uniqCombined(player_id)',
      type: 'number',
    },
  },
  powerPlayPoints: {
    id: 'powerPlayPoints',
    name: 'Power Play Points',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_power_play_points',
    type: 'quantitative',
    config: {
      sql: 'player_power_play_points',
      type: 'max',
    },
  },
  highestPowerPlayPoints: {
    id: 'highestPowerPlayPoints',
    name: 'Highest Power Play Points',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_highest_power_play_points',
    type: 'quantitative',
    config: {
      sql: 'player_highest_power_play_points',
      type: 'max',
    },
  },
  expLevel: {
    id: 'expLevel',
    name: 'EXP Level',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_exp_level',
    type: 'quantitative',
    config: {
      sql: 'player_exp_level',
      type: 'max',
    },
  },
  expPoints: {
    id: 'expPoints',
    name: 'EXP',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_exp_points',
    type: 'quantitative',
    config: {
      sql: 'player_exp_points',
      type: 'max',
    },
  },
  brawlers: {
    id: 'brawlers',
    name: 'Brawlers',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'player_brawlers_length',
    type: 'quantitative',
    config: {
      sql: 'player_brawlers_length',
      type: 'max',
    },
  },
})

export const brawlerMeasurements = asMeasurements({
  highestTrophies: {
    id: 'highestTrophies',
    name: 'Highest Trophies',
    icon: '',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'brawler_highest_trophies',
    type: 'quantitative',
    config: {
      sql: 'brawler_highest_trophies',
      type: 'max',
    },
  },
  trophies: {
    id: 'trophies',
    name: 'Trophies',
    icon: 'trophy',
    description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'brawler_trophies',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'brawler_trophies',
      type: 'avg',
    },
  },
  brawler: {
    id: 'brawler',
    name: 'Most played Brawler',
    icon: '',
    description: '',
    formatter: 'capitalizeWords',
    d3formatter: '',
    sign: -1,
    column: 'brawler_name',
    type: 'nominal',
    config: {
      sql: 'anyHeavy(brawler_name)',
      type: 'number',
    },
  },
  starpowers: {
    id: 'starpowers',
    name: 'Star Powers',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'brawler_starpowers_length',
    type: 'quantitative',
    config: {
      sql: 'brawler_starpowers_length',
      type: 'max',
    },
  },
  gadgets: {
    id: 'gadgets',
    name: 'Gadgets',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: 'brawler_gadgets_length',
    type: 'quantitative',
    config: {
      sql: 'brawler_gadgets_length',
      type: 'max',
    },
  },
})

const metaMeasurements = asMeasurements({
  timestamp: {
    // TODO
    id: 'timestamp',
    name: 'Last Update',
    icon: '⌚',
    description: '',
    formatter: 'yyyy-MM-ddTHH:mm',
    d3formatter: '',
    sign: -1,
    column: 'timestamp',
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
    icon: '⌚',
    description: '',
    formatter: 'yyyy-MM-dd',
    d3formatter: '',
    sign: -1,
    column: 'timestamp_day',
    type: 'temporal',
    config: {
      sql: 'formatDateTime(MAX(toStartOfDay(timestamp)), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
})

const battleMeasurements = asMeasurements({
  trophyChange: {
    id: 'trophyChange',
    name: 'Trophy Change',
    icon: 'trophy',
    description: '',
    formatter: '+.2f',
    d3formatter: '+.2f',
    sign: -1,
    column: 'battle_trophy_change',
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
    icon: '📈',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_victory',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_victory',
      type: 'avg',
    },
  },
  winRateAdj: {
    id: 'winRateAdj',
    name: 'Adjusted Win Rate',
    icon: '📈',
    description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_victory_adj',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: winratePosteriorRaw,
      type: 'number',
    },
  },
  winRateDiff: {
    id: 'winRateDiff',
    name: 'Win Rate Diff',
    icon: '📈',
    description: 'The Win Rate Difference compares the Win Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: '+.2%',
    d3formatter: '+.2%',
    sign: -1,
    column: 'battle_victory',
    type: 'quantitative',
    config: {
      sql: '', // TODO needs join
      type: 'number',
    },
  },
  wins: {
    id: 'wins',
    name: 'Wins',
    icon: '📈',
    description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'wins',
    type: 'quantitative',
    config: {
      sql: 'battle_victory',
      type: 'sum',
    },
  },
  winsZScore: {
    id: 'winsZScore',
    name: 'Wins z-Score',
    icon: '📈',
    description: 'The Wins z-score uses a statistical test to compare the wins of Brawlers with a Star Power / Gadget to those without. Scores higher/lower than 2 are good/bad.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    column: 'wins',
    type: 'quantitative',
    config: {
      sql: '', // TODO needs join
      type: 'number',
    },
  },
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    icon: '👇',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'picks',
    type: 'quantitative',
    config: {
      sql: '',
      type: 'count',
    },
  },
  pickRate: {
    id: 'pickRate',
    name: 'Pick Rate',
    icon: '👇',
    description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    percentageOver: 'brawler',
    column: 'picks',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: '',
      type: 'count',
    },
  },
  useRate: {
    id: 'useRate',
    name: 'Use Rate',
    icon: '🎯',
    description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    percentageOver: 'brawler',
    column: 'picks_weighted',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'player_brawlers_length',
      type: 'sum',
    },
  },
  starRate: {
    id: 'starRate',
    name: 'Star Player',
    icon: '⭐',
    description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_starplayer',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_is_starplayer',
      type: 'avg',
    },
  },
  starRateDiff: {
    id: 'starRateDiff',
    name: 'Star Player Diff.',
    icon: '⭐',
    description: 'The Star Rate Difference compares the Star Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: '+.2%',
    d3formatter: '+.2%',
    sign: -1,
    column: 'battle_starplayer',
    type: 'quantitative',
    config: {
      sql: '', // TODO needs join
      type: 'number',
    },
  },
  rank: {
    id: 'rank',
    name: 'Average Rank',
    icon: 'leaderboards',
    description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: +1,
    column: 'battle_rank',
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
    icon: '🏅',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'battle_rank1',
    type: 'quantitative',
    config: {
      sql: 'battle_rank1',
      type: 'sum',
    },
  },
  rank1Rate: {
    id: 'rank1Rate',
    name: '#1 Rate',
    icon: '📈',
    description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    column: 'battle_rank1',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'battle_rank1',
      type: 'avg',
    },
  },
  rank1RateDiff: {
    id: 'rank1RateDiff',
    name: '#1 Rate Diff.',
    icon: '📈',
    description: 'The #1 Rate Difference compares the #1 Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: '+.2%',
    d3formatter: '+.2%',
    sign: -1,
    column: 'battle_rank1',
    type: 'quantitative',
    config: {
      sql: '', // TODO needs join
      type: 'number',
    },
  },
  duration: {
    id: 'duration',
    name: 'Duration',
    icon: '⏰',
    description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
    formatter: 'duration',
    d3formatter: 'duration',
    sign: +1,
    column: 'battle_duration',
    type: 'quantitative',
    config: {
      sql: 'battle_duration',
      type: 'avg',
    },
  },
  level: {
    id: 'level',
    name: 'Average Level',
    icon: '🏅',
    description: '',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    column: 'battle_level',
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
    icon: '🏅',
    description: '',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    column: 'brawler_power',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'brawler_power',
      type: 'avg',
    },
  },
  starpowerName: {
    id: 'starpowerName',
    name: 'Star Power',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: '',
    type: 'nominal',
    config: {
      sql: 'any(brawler_starpower_name)',
      type: 'number',
    },
  },
  gadgetName: {
    id: 'gadgetName',
    name: 'Gadget',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: '',
    type: 'nominal',
    config: {
      sql: 'any(brawler_gadget_name)',
      type: 'number',
    },
  },
  eventId: {
    id: 'eventId',
    name: 'Event ID',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: '',
    type: 'nominal',
    config: {
      sql: 'any(battle_event_id)',
      type: 'number',
    },
  },
  map: {
    id: 'map',
    name: 'Map',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: '',
    type: 'nominal',
    config: {
      sql: 'any(battle_event_map)',
      type: 'number',
    },
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    icon: '',
    description: '',
    formatter: '',
    d3formatter: '',
    sign: -1,
    column: '',
    type: 'nominal',
    config: {
      sql: 'any(battle_event_mode)',
      type: 'number',
    },
  },
})

// same as battleMeasurements, but using clickhouse merge for mv
const mergedbattleMeasurements = asMeasurements({
  timestamp: {
    id: 'timestamp',
    name: 'Last Update',
    icon: '⌚',
    description: '',
    formatter: 'yyyy-MM-ddTHH:mm',
    d3formatter: '',
    sign: -1,
    column: 'timestamp',
    type: 'temporal',
    config: {
      sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    icon: '👇',
    description: '',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'picks',
    type: 'quantitative',
    config: {
      sql: 'sum(picks)',
      type: 'number',
    },
  },
  trophyChange: {
    id: 'trophyChange',
    name: 'Trophy Change',
    icon: 'trophy',
    description: '',
    formatter: '+.2f',
    d3formatter: '+.2f',
    sign: -1,
    column: 'battle_trophy_change',
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
    icon: '📈',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_victory',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_victory_state)',
      type: 'number',
    },
  },
  winRateAdj: {
    id: 'winRateAdj',
    name: 'Adjusted Win Rate',
    icon: '📈',
    description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_victory_adj',
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
    icon: '📈',
    description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    column: 'wins',
    type: 'quantitative',
    config: {
      sql: `${winRateMerged}*${picks}`,
      type: 'number',
    },
  },
  pickRate: {
    id: 'pickRate',
    name: 'Pick Rate',
    icon: '👇',
    description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    percentageOver: 'brawler',
    column: 'picks',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'SUM(picks)',
      type: 'number',
    },
  },
  useRate: {
    id: 'useRate',
    name: 'Use Rate',
    icon: '🎯',
    description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    percentageOver: 'brawler',
    column: 'picks_weighted',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'picks_weighted',
      type: 'sum',
    },
  },
  starRate: {
    id: 'starRate',
    name: 'Star Player',
    icon: '⭐',
    description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    column: 'battle_starplayer',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_starplayer_state)',
      type: 'number',
    },
  },
  rank: {
    id: 'rank',
    name: 'Average Rank',
    icon: 'leaderboards',
    description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: +1,
    column: 'battle_rank',
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
    icon: '📈',
    description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
    formatter: '.2%',
    d3formatter: '.2%',
    sign: -1,
    column: 'battle_rank1',
    type: 'quantitative',
    scale: {
      zero: false,
    },
    config: {
      sql: 'avgMerge(battle_rank1_state)',
      type: 'number',
    },
  },
  duration: {
    id: 'duration',
    name: 'Duration',
    icon: '⏰',
    description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
    formatter: 'duration',
    d3formatter: 'duration',
    sign: +1,
    column: 'battle_duration',
    type: 'quantitative',
    config: {
      sql: 'avgMerge(battle_duration_state)',
      type: 'number',
    },
  },
  level: {
    id: 'level',
    name: 'Average Level',
    icon: '🏅',
    description: '',
    formatter: '.2f',
    d3formatter: '.2f',
    sign: -1,
    column: 'battle_level',
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

export const commonMeasurements = asMeasurements({
  ...metaMeasurements,
  ...playerMeasurements,
  ...brawlerMeasurements,
  ...battleMeasurements,
})

const metaSlices = asSlice({
  season: {
    id: 'season',
    name: 'Since Time',
    column: 'trophy_season_end',
    config: {
      member: 'season_dimension',
      operator: 'afterDate',
    },
  },
  seasonExact: {
    id: 'seasonExact',
    name: 'Time',
    column: 'trophy_season_end_exact',
    config: {
      member: 'season_dimension',
      operator: 'equals',
    }
  },
  timestamp: {
    id: 'timestamp',
    name: 'Since Time',
    column: 'timestamp',
    config: {
      member: 'timestamp_dimension',
      operator: 'afterDate',
    }
  },
})

const playerSlices = asSlice({
  playerName: {
    id: 'playerName',
    name: 'Player Name',
    column: 'player_name_ilike',
    config: {
      member: 'player_name_dimension',
      operator: 'contains',
    },
  },
  playerId: {
    id: 'playerId',
    name: 'Player ID',
    column: 'player_id',
    config: {
      member: 'player_dimension',
      operator: 'equals',
    },
  },
})

const brawlerSlices = asSlice({
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    column: 'brawler_name',
    config: {
      member: 'brawler_dimension',
      operator: 'equals',
    },
  },
  brawlerId: {
    id: 'brawlerId',
    name: 'Brawler ID',
    column: 'brawler_id',
    config: {
      member: 'brawler_id_dimension',
      operator: 'equals',
    },
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    column: 'ally_brawler_name',
    config: {
      member: 'ally_brawler_dimension',
      operator: 'equals',
    },
  },
  allyId: {
    id: 'allyId',
    name: 'Ally ID',
    column: 'ally_brawler_id',
    config: {
      member: 'ally_brawler_id_dimension',
      operator: 'equals',
    },
  },
  trophyRangeGte: {
    id: 'trophyRangeGte',
    name: 'Trophy Range greater than equals',
    column: 'brawler_trophyrange',
    config: {
      member: 'trophyRange_dimension',
      operator: 'gte',
    },
  },
  trophyRangeLt: {
    id: 'trophyRangeLt',
    name: 'Trophy Range lower than',
    column: 'brawler_trophyrange',
    config: {
      member: 'trophyRange_dimension',
      operator: 'lt',
    },
  },
  starpowerIdEq: {
    id: 'starpowerIdEq',
    name: 'Star Power ID equals',
    column: '',
    config: {
      member: 'starpower_dimension',
      operator: 'equals',
    },
  },
  starpowerIdNeq: {
    id: 'starpowerIdNeq',
    name: 'Star Power ID not equals',
    column: '',
    config: {
      member: 'starpower_dimension',
      operator: 'notEquals',
    },
  },
  gadgetIdEq: {
    id: 'gadgetIdEq',
    name: 'Gadget ID equals',
    column: '',
    config: {
      member: 'gadget_dimension',
      operator: 'equals',
    },
  },
  gadgetIdNeq: {
    id: 'gadgetIdNeq',
    name: 'Gadget ID not equals',
    column: '',
    config: {
      member: 'gadget_dimension',
      operator: 'notEquals',
    },
  },
})

const battleSlices = asSlice({
  mode: {
    id: 'mode',
    name: 'Mode',
    column: 'battle_event_mode',
    config: {
      member: 'mode_dimension',
      operator: 'equals',
    },
  },
  map: {
    id: 'map',
    name: 'Map',
    column: 'battle_event_map',
    config: {
      member: 'map_dimension',
      operator: 'equals',
    },
  },
  id: {
    id: 'id',
    name: 'Event ID',
    column: '',
    config: {
      member: 'eventId_measure',
      operator: 'equals',
    },
  },
  mapLike: {
    id: 'mapLike',
    name: 'Map Name',
    column: 'battle_event_map_like',
    config: {
      member: 'map_dimension',
      operator: 'contains',
    },
  },
  mapNotLike: {
    id: 'mapNotLike',
    name: 'not Map Name',
    column: 'battle_event_map_notlike',
    config: {
      member: 'map_dimension',
      operator: 'notContains',
    },
  },
  powerplay: {
    id: 'powerplay',
    name: 'Power Play',
    column: 'battle_event_powerplay',
    config: {
      member: 'powerplay_dimension',
      operator: 'equals',
    },
  },
  bigbrawler: {
    id: 'bigbrawler',
    name: 'Big Brawler',
    column: 'battle_is_bigbrawler',
    config: {
      member: 'bigbrawler_dimension',
      operator: 'equals',
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
  mergedbattleMeasurements.timestamp,
  mergedbattleMeasurements.trophyChange,
  mergedbattleMeasurements.winRate,
  mergedbattleMeasurements.winRateAdj,
  mergedbattleMeasurements.wins,
  mergedbattleMeasurements.picks,
  mergedbattleMeasurements.pickRate,
  mergedbattleMeasurements.useRate,
  mergedbattleMeasurements.starRate,
  mergedbattleMeasurements.rank,
  mergedbattleMeasurements.rank1Rate,
  mergedbattleMeasurements.duration,
  mergedbattleMeasurements.level,
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
  trophyRangeLt: ['10'],
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
  commonSlices.trophyRangeGte,
  commonSlices.trophyRangeLt,
  commonSlices.brawlerId,
  commonSlices.brawler,
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
    hidden: false,
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
    hidden: false,
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
    hidden: false,
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
    hidden: false,
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
    table: 'player_brawler',
    name: 'Brawler Leaderboard',
    hidden: false,
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
      commonDimensions.mode,
      commonDimensions.map,
      commonDimensions.powerplay,
      commonDimensions.team,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      ...playerBrawlerMeasurements,
      battleMeasurements.wins,
      battleMeasurements.duration,
      battleMeasurements.rank,
      battleMeasurements.rank1,
      battleMeasurements.trophyChange,
      battleMeasurements.winRate,
      battleMeasurements.winRateAdj,
      battleMeasurements.starRate,
      battleMeasurements.rank,
      // TODO
    ],
    defaultMeasurementIds: ['picks'],
    metaMeasurements: ['timestamp', 'picks'],
    slices: [
      ...playerBrawlerSlices,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.powerplay,
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
