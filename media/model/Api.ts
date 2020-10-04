import { BattleMeasures, TrophiesRow } from "./Clicker"

export interface PlayerModeWinrates {
  [id: string]: {
    name: string
    stats: BattleMeasures
  }
}

export interface PlayerBrawlerWinrates {
  [id: string]: {
    name: string
    stats: BattleMeasures
  }
}

export interface Brawler {
  name: string;
  trophies: number;
  highestTrophies: number;
  power: number;
  rank: number;
}

export interface Battle {
  timestamp: Date|string;
  event: {
    id: number;
    mode: string;
    map: string;
  },
  result: string;
  victory: undefined|boolean;
  trophyChange: undefined|number;
  teams: {
    tag: string;
    name: string;
    brawler: string;
    brawlerTrophies: number;
    isBigbrawler: boolean;
  }[][]
}

export interface PlayerLifetimeStats {
  trophies: number;
  highestTrophies: number;
  powerPlayPoints: number;
  highestPowerPlayPoints: number;
  expLevel: number;
  victories: number;
  soloVictories: number;
  duoVictories: number;
}

export interface Player {
  tag: string;
  name: string;
  hoursSpent: number;
  trophies: number;
  clubName: string;
  qualifiedFromChampionshipChallenge: boolean;
  stats: PlayerLifetimeStats;
  brawlers: {
    [id: string]: Brawler;
  };
  battles: Battle[];
}

interface Sample {
  sampleSize: number;
  stats: {
    [stat: string]: number;
  }
}

export interface BrawlerMetaStatistics extends Sample {
  id: string;
  name: string;
}

export interface ActiveEvent {
  id: string;
  map: string;
  mode: string;
  start: string;
  end: string;
}

export interface CurrentAndUpcomingEvents {
  current: ActiveEvent[]
  upcoming: ActiveEvent[]
}

export interface LeaderboardEntry {
  name: string;
  tag: string;
  metric: number;
}

export interface Leaderboard {
  metric: string
  entries: LeaderboardEntry[]
}
