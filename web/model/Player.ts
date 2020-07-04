import { BrawlerHistoryEntry, PlayerHistoryEntry } from "./History";

export interface Statistic {
    label: string;
    value: number | string;
}

export interface PlayerStatistic extends Statistic {
}

export interface ModeStatistic extends Statistic {
}

export interface Mode {
    label: string;
    icon: string;
    background: string;
    stats: {
        [id: string]: ModeStatistic;
    };
}

export interface Brawler {
    name: string;
    trophies: number;
    highestTrophies: number;
    power: number;
    rank: number;
    history: BrawlerHistoryEntry[];
}

export interface PlayerIdentifier {
    tag: string;
    name: string;
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

export interface Player extends PlayerIdentifier {
    hoursSpent: number;
    trophies: number;
    clubName: string;
    history: PlayerHistoryEntry[];
    brawlers: {
        [id: string]: Brawler;
    };
    heroStats: {
        [id: string]: PlayerStatistic;
    }
    modes: {
        [id: string]: Mode;
    };
    battles: Battle[];
}
