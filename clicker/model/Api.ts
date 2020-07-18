import { BattleMeasures } from "./Clicker"
import { PlayerHistoryEntry, BrawlerHistoryEntry } from "./History";

export interface PlayerWinrates {
  mode: {
    [id: string]: {
      name: string
      stats: BattleMeasures
    }
  }
  brawler: {
    [id: string]: {
      name: string
      stats: BattleMeasures
    }
  }
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

export interface Player {
  tag: string;
  name: string;
  hoursSpent: number;
  trophies: number;
  winrates: Partial<PlayerWinrates>;
  clubName: string;
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
