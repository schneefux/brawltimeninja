export interface BattleMeasures {
  timestamp: string;
  picks: number;
  picksWeighted: number;
  duration: number;
  rank: number;
  rank1Rate: number;
  winRate: number;
  starRate: number;
  level: number;
  trophyChange: number;
}

interface PlayerDimensions {
  name: string;
  timestamp: string;
}

export interface PlayerMeasures extends PlayerDimensions {
  expPoints: number;
  trophies: number;
  powerPlayPoints: number;
  victories: number;
  soloVictories: number;
  duoVictories: number;
}

export interface BrawlerMeasures extends PlayerDimensions {
  brawlerName: string;
  power: number
  trophies: number
  highestTrophies: number
}

export interface BrawlerMetaRow extends BattleMeasures {
  brawlerName: string;
}

export interface TrophyRow extends BattleMeasures {
  trophyrange: number;
}

export interface BrawlerStatisticsRows {
  brawlerByTrophies: TrophyRow[]
  totalByTrophies: TrophyRow[]
}

export interface StarpowerMetaRow extends BattleMeasures {
  brawlerId: number;
  brawlerName: string;
  starpowerId: number;
  starpowerName: string;
}

export interface GadgetMetaRow extends BattleMeasures {
  brawlerId: number;
  brawlerName: string;
  gadgetId: number;
  gadgetName: string;
}

export interface ModeMetaRow extends BattleMeasures {
  mode: string;
  brawlerName: string;
}

export interface MapMetaRow extends BattleMeasures {
  brawlerName: string
  id: number;
  mode: string
  map: string;
  isBigbrawler: boolean;
  level: number;
}

export interface PlayerMetaRow extends BattleMeasures {
}

export interface PlayerModeMetaRow extends BattleMeasures {
  mode: string;
  trophyChange: number;
}

export interface PlayerBrawlerMetaRow extends BattleMeasures {
  brawlerId: number;
  brawlerName: string;
  trophyChange: number;
}

export interface LeaderboardRow extends PlayerMeasures {
  tag: string;
}

export interface BrawlerLeaderboardRow extends BrawlerMeasures {
  tag: string;
  brawlerName: string;
}

export interface PlayerWinRatesRows {
  total: PlayerMetaRow[];
  mode: PlayerModeMetaRow[];
  brawler: PlayerBrawlerMetaRow[];
}

export interface TrophiesRow {
  timestamp: string
  trophies: number
}

export interface BrawlerTrophiesRow extends TrophiesRow {
  name: string
  id: string
}

