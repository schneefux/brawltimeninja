import { capitalizeWords, formatMode, formatSI } from './util'

export interface Config extends Record<string, Cube> {}

export interface State {
  cubeId: string
  slices: SliceValue
  comparingSlices: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
  sortId: string
  comparing: boolean
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
  metaColumns: string[]
  slices: Slice[]
  defaultSliceValues: SliceValue
}

export interface Measurement {
  id: string
  name: string
  nameShort: string
  icon: string
  description: string
  formatter: (n: number) => string
  d3formatter: string
  sign: number
  percentage: boolean
  column: string
  type: 'quantitative'|'temporal'|'ordinal'|'nominal'
  scale?: any // https://vega.github.io/vega-lite/docs/scale.html
}

export interface Dimension {
  id: string
  name: string
  formatter: (o: object) => string
  column: string
  anyColumns: string[]
  hidden: boolean
  type: 'quantitative'|'temporal'|'ordinal'|'nominal'
  scale?: any // https://vega.github.io/vega-lite/docs/scale.html
}

export interface Slice {
  id: string
  name: string
  column: string
  // TODO: for description
  // formatter: (s: SliceValue) => string
}

export interface SliceValue extends Record<string, string[]> { }

const commonDimensions: Record<string, Dimension> = {
  season: {
    id: 'season',
    name: 'Bi-Week',
    formatter: (s: any) => s.trophy_season_end,
    column: 'trophy_season_end',
    anyColumns: [],
    hidden: false,
    type: 'temporal',
    scale: {
      nice: 'week',
    },
  },
  day: {
    id: 'day',
    name: 'Day',
    formatter: (s: any) => s.timestamp_day,
    column: 'timestamp_day',
    anyColumns: [],
    hidden: false,
    type: 'temporal',
    scale: {
      nice: 'day',
    },
  },
  player: {
    id: 'player',
    name: 'Player',
    formatter: (p: any) => p.player_name,
    column: 'player_id',
    anyColumns: ['player_name', /* 'player_tag', FIXME */ 'player_icon_id'],
    hidden: false,
    type: 'nominal',
  },
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    formatter: (b: any) => capitalizeWords(b.brawler_name.toLowerCase()),
    column: 'brawler_name',
    anyColumns: [],
    hidden: false,
    type: 'nominal',
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    formatter: (a: any) => capitalizeWords(a.ally_brawler_name.toLowerCase()),
    column: 'ally_brawler_name',
    anyColumns: [],
    hidden: false,
    type: 'nominal',
  },
  gadget: {
    id: 'gadget',
    name: 'Gadget',
    formatter: (g: any) => capitalizeWords(g.brawler_gadget_name.toLowerCase()),
    column: 'brawler_gadget_id',
    anyColumns: ['brawler_gadget_name', 'brawler_name'],
    hidden: false,
    type: 'nominal',
  },
  starpower: {
    id: 'starpower',
    name: 'Star Power',
    formatter: (s: any) => capitalizeWords(s.brawler_starpower_name.toLowerCase()),
    column: 'brawler_starpower_id',
    anyColumns: ['brawler_starpower_name', 'brawler_name'],
    hidden: false,
    type: 'nominal',
  },
  team: {
    id: 'team',
    name: 'Team',
    formatter: (t: any) => capitalizeWords(t.brawler_names.join(', ').toLowerCase()),
    column: 'brawler_names',
    anyColumns: [],
    hidden: false,
    type: 'nominal',
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    formatter: (m: any) => formatMode(m.battle_event_mode),
    column: 'battle_event_mode',
    anyColumns: [],
    hidden: false,
    type: 'nominal',
  },
  map: {
    id: 'map',
    name: 'Map',
    formatter: (m: any) => m.battle_event_map,
    column: 'battle_event_map',
    anyColumns: ['battle_event_mode', 'battle_event_id'],
    hidden: false,
    type: 'nominal',
  },
}

export const playerMeasurements: Record<string, Measurement> = {
  playerTrophies: {
    id: 'playerTrophies',
    name: 'Player Trophies',
    nameShort: 'Trophies',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_trophies',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  playerHighestTrophies: {
    id: 'playerHighestTrophies',
    name: 'Player Highest Trophies',
    nameShort: 'Trophy Max',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_highest_trophies',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  victories: {
    id: 'victories',
    name: '3v3 Victories',
    nameShort: 'Victories',
    icon: '',
    description: '',
    formatter: n => formatSI(n, 2),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_3vs3_victories',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  exp: {
    id: 'exp',
    name: 'Experience',
    nameShort: 'EXP',
    icon: '',
    description: '',
    formatter: n => formatSI(n, 2),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_exp_points',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  soloVictories: {
    id: 'soloVictories',
    name: 'Solo Victories',
    nameShort: 'SD Victories',
    icon: '',
    description: '',
    formatter: n => formatSI(n, 2),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_solo_victories',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  duoVictories: {
    id: 'duoVictories',
    name: 'Duo Victories',
    nameShort: 'SD Victories',
    icon: '',
    description: '',
    formatter: n => formatSI(n, 2),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'player_duo_victories',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
}

export const brawlerMeasurements: Record<string, Measurement> = {
  highestTrophies: {
    id: 'highestTrophies',
    name: 'Highest Trophies',
    nameShort: 'Highest Trophies',
    icon: '',
    description: '',
    formatter: n => n.toString(),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'brawler_highest_trophies',
    type: 'quantitative',
  },
  trophies: {
    id: 'trophies',
    name: 'Trophies',
    nameShort: 'Trophies',
    icon: 'trophy',
    description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
    formatter: n => n.toString(),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'brawler_trophies',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
}

export const commonMeasurements: Record<string, Measurement> = {
  timestamp: {
    // TODO
    id: 'timestamp',
    name: 'Last Update',
    nameShort: 'Updated',
    icon: '⌚',
    description: '',
    formatter: n => n.toString(),
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'timestamp',
    type: 'temporal',
  },
  trophyChange: {
    id: 'trophyChange',
    name: 'Trophy Change',
    nameShort: 'TrophyD',
    icon: 'trophy',
    description: '',
    formatter: n => n <= 0 ? `${n.toFixed(2)}` : `+${n.toFixed(2)}`,
    d3formatter: '+.2f',
    sign: -1,
    percentage: false,
    column: 'battle_trophy_change',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  winRate: {
    id: 'winRate',
    name: 'Win Rate',
    nameShort: 'Win',
    icon: '📈',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: n => `${(100 * n).toFixed(1)}%`,
    d3formatter: '.1%',
    sign: -1,
    percentage: false,
    column: 'battle_victory',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  winRateAdj: {
    id: 'winRateAdj',
    name: 'Adjusted Win Rate',
    nameShort: 'Win',
    icon: '📈',
    description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
    formatter: n => `${(100 * n).toFixed(1)}%`,
    d3formatter: '.1%',
    sign: -1,
    percentage: false,
    column: 'battle_victory_adj',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  winRateDiff: {
    id: 'winRateDiff',
    name: 'Win Rate Diff',
    nameShort: 'WinD',
    icon: '📈',
    description: 'The Win Rate Difference compares the Win Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: n => `${n > 0 ? '+' : ''}${(100 * n).toFixed(2)}%`,
    d3formatter: '+.2%',
    sign: -1,
    percentage: false,
    column: 'battle_victory',
    type: 'quantitative',
  },
  wins: {
    id: 'wins',
    name: 'Wins',
    nameShort: 'Wins',
    icon: '📈',
    description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
    formatter: n => formatSI(n, 1),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'wins',
    type: 'quantitative',
  },
  winsZScore: {
    id: 'winsZScore',
    name: 'Wins z-Score',
    nameShort: 'Win-z',
    icon: '📈',
    description: 'The Wins z-score uses a statistical test to compare the wins of Brawlers with a Star Power / Gadget to those without. Scores higher/lower than 2 are good/bad.',
    formatter: n => n.toFixed(2),
    d3formatter: '.2f',
    sign: -1,
    percentage: false,
    column: 'wins',
    type: 'quantitative',
  },
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    nameShort: 'Picks',
    icon: '👇',
    description: '',
    formatter: n => formatSI(n, 1),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'picks',
    type: 'quantitative',
  },
  pickRate: {
    id: 'pickRate',
    name: 'Pick Rate',
    nameShort: 'Picked',
    icon: '👇',
    description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    formatter: n => `${(100 * n).toFixed(2)}%`,
    d3formatter: '.2%',
    sign: -1,
    percentage: true,
    column: 'picks',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  useRate: {
    id: 'useRate',
    name: 'Use Rate',
    nameShort: 'Used',
    icon: '🎯',
    description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
    formatter: n => `${(100 * n).toFixed(2)}%`,
    d3formatter: '.2%',
    sign: -1,
    percentage: true,
    column: 'picks_weighted',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  starRate: {
    id: 'starRate',
    name: 'Star Player',
    nameShort: 'Star',
    icon: '⭐',
    description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    formatter: n => `${(100 * n).toFixed(1)}%`,
    d3formatter: '.1%',
    sign: -1,
    percentage: false,
    column: 'battle_starplayer',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  starRateDiff: {
    id: 'starRateDiff',
    name: 'Star Player Diff.',
    nameShort: 'StarD',
    icon: '⭐',
    description: 'The Star Rate Difference compares the Star Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: n => `${n > 0 ? '+' : ''}${(100 * n).toFixed(2)}%`,
    d3formatter: '+.2%',
    sign: -1,
    percentage: false,
    column: 'battle_starplayer',
    type: 'quantitative',
  },
  rank: {
    id: 'rank',
    name: 'Average Rank',
    nameShort: 'Rank',
    icon: 'leaderboards',
    description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    formatter: n => n === null ? 'N/A' : n.toFixed(2),
    d3formatter: '.2f',
    sign: +1,
    percentage: false,
    column: 'battle_rank',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  rank1: {
    id: 'rank1',
    name: '#1 Recorded',
    nameShort: 'Rank 1',
    icon: '🏅',
    description: '',
    formatter: n => formatSI(n, 1),
    d3formatter: '.2s',
    sign: -1,
    percentage: false,
    column: 'battle_rank1',
    type: 'quantitative',
  },
  rank1Rate: {
    id: 'rank1Rate',
    name: '#1 Rate',
    nameShort: 'SD Win',
    icon: '📈',
    description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
    formatter: n => `${(100 * n).toFixed(2)}%`,
    d3formatter: '.2%',
    sign: -1,
    percentage: false,
    column: 'battle_rank1',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  rank1RateDiff: {
    id: 'rank1RateDiff',
    name: '#1 Rate Diff.',
    nameShort: 'SD WinD',
    icon: '📈',
    description: 'The #1 Rate Difference compares the #1 Rate of Brawlers with a Star Power / Gadget to those without.',
    formatter: n => `${n > 0 ? '+' : ''}${(100 * n).toFixed(2)}%`,
    d3formatter: '+.2%',
    sign: -1,
    percentage: false,
    column: 'battle_rank1',
    type: 'quantitative',
  },
  duration: {
    id: 'duration',
    name: 'Duration',
    nameShort: 'Duration',
    icon: '⏰',
    description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
    formatter: n => `${Math.floor(n / 60)}:${Math.floor(n % 60).toString().padStart(2, '0')}`,
    d3formatter: '',
    sign: +1,
    percentage: false,
    column: 'battle_duration',
    type: 'quantitative',
  },
  level: {
    id: 'level',
    name: 'Average Level',
    nameShort: 'Level',
    icon: '🏅',
    description: '',
    formatter: n => n.toFixed(2),
    d3formatter: '.2f',
    sign: -1,
    percentage: false,
    column: 'battle_level',
    type: 'quantitative',
    scale: {
      zero: false,
    },
  },
  users: {
    id: 'users',
    name: 'Players',
    nameShort: 'Players',
    icon: '🧑',
    description: 'The total number of players.',
    formatter: n => formatSI(n, 1),
    d3formatter: '.1s',
    sign: -1,
    percentage: false,
    column: 'users',
    type: 'quantitative',
  },
  powerPlayPoints: {
    id: 'powerPlayPoints',
    name: 'Power Play Points',
    nameShort: 'Points',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_power_play_points',
    type: 'quantitative',
  },
  highestPowerPlayPoints: {
    id: 'highestPowerPlayPoints',
    name: 'Highest Power Play Points',
    nameShort: 'Points Max',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_highest_power_play_points',
    type: 'quantitative',
  },
  expLevel: {
    id: 'expLevel',
    name: 'EXP Level',
    nameShort: 'EXP',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_exp_level',
    type: 'quantitative',
  },
  victories: {
    id: 'victories',
    name: '3v3 Wins',
    nameShort: '3v3 Win',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_3vs3_victories',
    type: 'quantitative',
  },
  soloVictories: {
    id: 'soloVictories',
    name: 'Solo Wins',
    nameShort: 'Solo Win',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_solo_victories',
    type: 'quantitative',
  },
  duoVictories: {
    id: 'duoVictories',
    name: 'Duo Wins',
    nameShort: 'Duo Win',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_duo_victories',
    type: 'quantitative',
  },
  trophies: playerMeasurements.playerTrophies,
}

const brawlerBattleMeasurements = {
  trophyChange: commonMeasurements.trophyChange,
  winRate: commonMeasurements.winRate,
  winRateAdj: commonMeasurements.winRateAdj,
  wins: commonMeasurements.wins,
  picks: commonMeasurements.picks,
  pickRate: commonMeasurements.pickRate,
  useRate: commonMeasurements.useRate,
  starRate: commonMeasurements.starRate,
  rank: commonMeasurements.rank,
  rank1Rate: commonMeasurements.rank1Rate,
  duration: commonMeasurements.duration,
  level: commonMeasurements.level,
}

const commonSlices: Record<string, Slice> = {
  season: {
    id: 'season',
    name: 'Time',
    column: 'trophy_season_end',
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    column: 'battle_event_mode',
  },
  map: {
    id: 'map',
    name: 'Map',
    column: 'battle_event_map',
  },
  mapLike: {
    id: 'mapLike',
    name: 'Map Name',
    column: 'battle_event_map_like',
  },
  mapNotLike: {
    id: 'mapNotLike',
    name: 'not Map Name',
    column: 'battle_event_map_notlike',
  },
  powerplay: {
    id: 'powerplay',
    name: 'Power Play',
    column: 'battle_event_powerplay',
  },
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    column: 'brawler_name',
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    column: 'ally_brawler_name',
  },
  trophies: {
    id: 'trophies',
    name: 'Trophies',
    column: 'brawler_trophyrange',
  },
  playerName: {
    id: 'playerName',
    name: 'Player Name',
    column: 'player_name_ilike',
  },
  playerTag: {
    id: 'playerTag',
    name: 'Player Tag',
    column: 'player_tag',
  },
  withStarpower: {
    id: 'withStarpower',
    name: 'Star Power detected',
    column: 'with_starpower',
  },
  withGadget: {
    id: 'withGadget',
    name: 'Gadget detected',
    column: 'with_gadget',
  },
}

const cubes: Record<string, Cube> = {
  map: {
    id: 'map',
    table: 'meta_map',
    name: 'Map',
    hidden: false,
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.mode,
      commonDimensions.map,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.mapLike,
      commonSlices.mapNotLike,
      commonSlices.powerplay,
      commonSlices.trophies,
    ],
    defaultSliceValues: {
      season: ['month'],
      mode: [],
      map: [],
      mapLike: [],
      mapNotLike: [],
      powerplay: ['false'],
      trophies: [],
    },
  },
  starpower: {
    id: 'starpower',
    table: 'meta_starpower',
    name: 'Star Power',
    hidden: false,
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.starpower,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['brawler', 'starpower'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.trophies,
      commonSlices.withStarpower,
    ],
    defaultSliceValues: {
      season: ['month'],
      trophies: [],
      withStarpower: ['true'],
    },
  },
  gadget: {
    id: 'gadget',
    table: 'meta_gadget',
    name: 'Gadget',
    hidden: false,
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.gadget,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['brawler', 'gadget'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.trophies,
      commonSlices.withGadget,
    ],
    defaultSliceValues: {
      season: ['month'],
      trophies: [],
      withGadget: ['true'],
    },
  },
  synergy: {
    id: 'synergy',
    table: 'meta_synergy',
    name: 'Synergies',
    hidden: false,
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.ally,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.brawler,
      commonSlices.ally,
      commonSlices.trophies,
    ],
    defaultSliceValues: {
      season: ['month'],
      mode: [],
      map: [],
      brawler: [],
      ally: [],
      trophies: [],
    },
  },
  team: {
    id: 'team',
    table: 'team',
    name: 'Teams',
    hidden: false,
    dimensions: [
      commonDimensions.team,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['team'],
    measurements: [
      commonMeasurements.wins,
      commonMeasurements.picks,
      commonMeasurements.winRate,
    ],
    defaultMeasurementIds: ['wins'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.trophies,
    ],
    defaultSliceValues: {
      season: ['month'],
      mode: [],
      map: [],
      trophies: [],
    },
  },
  player: {
    id: 'player',
    table: 'player',
    name: 'Leaderboard',
    hidden: false,
    dimensions: [
      commonDimensions.player,
      commonDimensions.season,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      playerMeasurements.playerTrophies,
      playerMeasurements.playerHighestTrophies,
      playerMeasurements.victories,
      playerMeasurements.soloVictories,
      playerMeasurements.duoVictories,
      playerMeasurements.exp,
    ],
    defaultMeasurementIds: ['victories'],
    metaColumns: ['timestamp'],
    slices: [
    ],
    defaultSliceValues: {
    },
  },
  brawler: {
    id: 'brawler',
    table: 'brawler',
    name: 'Brawler Leaderboard',
    hidden: true,
    dimensions: [
      commonDimensions.player,
      commonDimensions.brawler,
      commonDimensions.season,
      commonDimensions.day,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      playerMeasurements.playerTrophies,
      playerMeasurements.playerHighestTrophies,
      brawlerMeasurements.trophies,
      brawlerMeasurements.highestTrophies,
    ],
    defaultMeasurementIds: ['highestTrophies'],
    metaColumns: ['timestamp'],
    slices: [
      commonSlices.brawler,
      commonSlices.playerName,
      commonSlices.playerTag,
      commonSlices.season,
    ],
    defaultSliceValues: {
      brawler: ['SHELLY'],
      playerName: [],
      playerTag: [],
      season: ['month'],
      day: [],
    },
  },
  battle: {
    id: 'battle',
    table: 'battle',
    name: 'Raw Battles',
    hidden: true,
    dimensions: [
      commonDimensions.player,
      commonDimensions.brawler,
      commonDimensions.season,
      commonDimensions.day,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      commonMeasurements.trophyChange,
      commonMeasurements.winRate,
      commonMeasurements.wins,
      commonMeasurements.picks,
      commonMeasurements.pickRate,
      commonMeasurements.useRate,
      commonMeasurements.rank,
      commonMeasurements.duration,
      brawlerMeasurements.trophies,
      playerMeasurements.playerTrophies,
      playerMeasurements.playerHighestTrophies,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.powerplay,
      commonSlices.trophies,
      commonSlices.playerName,
      commonSlices.playerTag,
    ],
    defaultSliceValues: {
      season: ['month'],
      powerplay: [],
      trophies: [],
      playerName: [],
      playerTag: [],
      day: [],
    },
  },
}

export default cubes
