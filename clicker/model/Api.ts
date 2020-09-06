import { BattleMeasures } from "./Clicker"
import { PlayerHistoryEntry, BrawlerHistoryEntry } from "./History";

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

export interface PlayerWinrates {
  mode: PlayerModeWinrates
  brawler: PlayerBrawlerWinrates
  total: {
    stats: BattleMeasures
  }
}

export interface Brawler {
    name: string;
    trophies: number;
    highestTrophies: number;
    power: number;
    rank: number;
    history: BrawlerHistoryEntry[];
}

export interface Statistic {
    label: string;
    value: number | string;
}

export interface Mode {
    label: string;
    icon: string;
    background: string;
    stats: {
        [id: string]: Statistic;
    };
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
  winrates: Partial<PlayerWinrates>;
  clubName: string;
  qualifiedFromChampionshipChallenge: boolean;
  stats: PlayerLifetimeStats;
  history: PlayerHistoryEntry[];
  brawlers: {
      [id: string]: Brawler;
  };
  heroStats: {
      [id: string]: Statistic;
  }
  modes: {
      [id: string]: Mode;
  };
  battles: Battle[];
}

export interface BrawlerMetaStatistics {
  id: string;
  name: string;
  sampleSize: number;
  stats: {
    [stat: string]: number;
  }
}

export interface StarpowerMetaStatistics {
  id: string;
  brawlerName: string;
  brawlerId: number;
  starpowerName: string;
  sampleSize: number;
  stats: {
    winRate: number;
    starRate: number;
    rank1Rate: number;
  }
}

export interface GadgetMetaStatistics {
  id: string;
  brawlerName: string;
  brawlerId: number;
  gadgetName: string;
  sampleSize: number;
  stats: {
    winRate: number;
    starRate: number;
    rank1Rate: number;
  }
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
