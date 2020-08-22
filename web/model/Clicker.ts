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

export interface PlayerMeasures {
  name: string;
  timestamp: string;
  expPoints: number;
  trophies: number;
  powerPlayPoints: number;
  victories: number;
  soloVictories: number;
  duoVictories: number;
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
  playerTag: string;
  playerName: string;
}

export interface PlayerWinRatesRows {
  total: PlayerMetaRow[];
  mode: PlayerModeMetaRow[];
  brawler: PlayerBrawlerMetaRow[];
}
