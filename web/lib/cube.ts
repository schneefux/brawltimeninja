import { capitalizeWords, formatMode, formatSI } from './util'

export interface Config extends Record<string, Cube> {}

export interface Cube {
  id: string
  table: string
  name: string
  dimensions: Dimension[]
  defaultDimensionsIds: string[]
  measurements: Measurement[]
  defaultMeasurementId: string
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
}

export interface Dimension {
  id: string
  name: string
  formatter: (o: object) => string
  column: string
  anyColumns: string[]
  hidden: boolean
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
  player: {
    id: 'player',
    name: 'Player',
    formatter: (p: any) => p.player_name,
    column: 'player_id',
    anyColumns: ['player_name', 'player_icon_id'],
    hidden: false,
  },
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    formatter: (b: any) => capitalizeWords(b.brawler_name.toLowerCase()),
    column: 'brawler_name',
    anyColumns: [],
    hidden: false,
  },
  brawlerHidden: {
    id: 'brawler',
    name: 'Brawler',
    formatter: (b: any) => capitalizeWords(b.brawler_name.toLowerCase()),
    column: 'brawler_name',
    anyColumns: [],
    hidden: true,
  },
  ally: {
    id: 'ally',
    name: 'Ally',
    formatter: (a: any) => capitalizeWords(a.ally_brawler_name.toLowerCase()),
    column: 'ally_brawler_name',
    anyColumns: [],
    hidden: false,
  },
  gadget: {
    id: 'gadget',
    name: 'Gadget',
    formatter: (g: any) => capitalizeWords(g.brawler_gadget_name.toLowerCase()),
    column: 'brawler_gadget_id',
    anyColumns: ['brawler_gadget_name', 'brawler_name'],
    hidden: false,
  },
  starpower: {
    id: 'starpower',
    name: 'Star Power',
    formatter: (s: any) => capitalizeWords(s.brawler_starpower_name.toLowerCase()),
    column: 'brawler_starpower_id',
    anyColumns: ['brawler_starpower_name', 'brawler_name'],
    hidden: false,
  },
  team: {
    id: 'team',
    name: 'Team',
    formatter: (t: any) => capitalizeWords(t.brawler_names.join(', ').toLowerCase()),
    column: 'brawler_names',
    anyColumns: [],
    hidden: false,
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    formatter: (m: any) => formatMode(m.battle_event_mode),
    column: 'battle_event_mode',
    anyColumns: [],
    hidden: false,
  },
  map: {
    id: 'map',
    name: 'Map',
    formatter: (m: any) => m.battle_event_map,
    column: 'battle_event_map',
    anyColumns: ['battle_event_mode', 'battle_event_id'],
    hidden: false,
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
  },
  trophies: {
    id: 'trophies',
    name: 'Trophies',
    nameShort: 'Trophies',
    icon: 'trophy',
    description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
    formatter: n => formatSI(n, 1),
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'brawler_trophies',
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
  },
  highestTrophies: {
    id: 'highestTrophies',
    name: 'Highest Trophies',
    nameShort: 'Trophy Max',
    icon: '',
    description: '',
    formatter: n => `${n}`,
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'player_highest_trophies',
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
  },
}

export const playerMeasurements: Record<string, Measurement> = {
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
    d3formatter: '',
    sign: -1,
    percentage: false,
    column: 'brawler_highest_trophies',
  },
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
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.mode,
      commonDimensions.map,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementId: 'winRateAdj',
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.powerplay,
      commonSlices.trophies,
    ],
    defaultSliceValues: {
      season: ['balance'],
      powerplay: ['false'],
    },
  },
  starpower: {
    id: 'starpower',
    table: 'meta_starpower',
    name: 'Star Power',
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.starpower,
    ],
    defaultDimensionsIds: ['brawler', 'starpower'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementId: 'winRateAdj',
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.trophies,
      commonSlices.withStarpower,
    ],
    defaultSliceValues: {
      season: ['balance'],
      withStarpower: ['true'],
    },
  },
  gadget: {
    id: 'gadget',
    table: 'meta_gadget',
    name: 'Gadget',
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.gadget,
    ],
    defaultDimensionsIds: ['brawler', 'gadget'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementId: 'winRateAdj',
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.trophies,
      commonSlices.withGadget,
    ],
    defaultSliceValues: {
      season: ['balance'],
      withGadget: ['true'],
    },
  },
  synergy: {
    id: 'synergy',
    table: 'meta_synergy',
    name: 'Synergies',
    dimensions: [
      commonDimensions.brawler,
      commonDimensions.ally,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      ...Object.values(brawlerBattleMeasurements),
    ],
    defaultMeasurementId: 'winRateAdj',
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
      season: ['balance'],
    },
  },
  team: {
    id: 'team',
    table: 'team',
    name: 'Teams',
    dimensions: [
      commonDimensions.team,
    ],
    defaultDimensionsIds: ['team'],
    measurements: [
      commonMeasurements.wins,
      commonMeasurements.picks,
      commonMeasurements.winRate,
    ],
    defaultMeasurementId: 'wins',
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.mode,
      commonSlices.map,
      commonSlices.trophies,
    ],
    defaultSliceValues: {
      season: ['balance'],
    },
  },
  player: {
    id: 'player',
    table: 'player',
    name: 'Leaderboard',
    dimensions: [
      commonDimensions.player,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      playerMeasurements.victories,
      playerMeasurements.soloVictories,
      playerMeasurements.duoVictories,
      playerMeasurements.exp,
    ],
    defaultMeasurementId: 'victories',
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
    dimensions: [
      commonDimensions.player,
      commonDimensions.brawler,
    ],
    defaultDimensionsIds: ['player'],
    measurements: [
      brawlerMeasurements.highestTrophies,
    ],
    defaultMeasurementId: 'highestTrophies',
    metaColumns: ['timestamp'],
    slices: [
      commonSlices.brawler,
    ],
    defaultSliceValues: {
      brawler: ['SHELLY'],
    },
  },
  battle: {
    id: 'battle',
    table: 'battle',
    name: 'Raw Battles',
    dimensions: [
      commonDimensions.player,
      commonDimensions.brawler,
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
    ],
    defaultMeasurementId: 'winRateAdj',
    metaColumns: ['picks', 'timestamp'],
    slices: [
      commonSlices.season,
      commonSlices.powerplay,
      commonSlices.trophies,
      commonSlices.playerName,
    ],
    defaultSliceValues: {
      season: ['balance'],
    },
  },
}

export default cubes