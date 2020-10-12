import { BattleMeasures } from "./Clicker"
import { Player as BrawlstarsPlayer } from "./Brawlstars"

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

export interface StarPower {
  id: number
  name: string
}

export interface Gadget extends StarPower {
}

export interface Brawler {
  name: string;
  trophies: number;
  highestTrophies: number;
  power: number;
  rank: number;
  starPowers: StarPower[];
  gadgets: Gadget[];
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

export interface Player extends Omit<BrawlstarsPlayer, 'brawlers'> {
  hoursSpent: number;
  brawlers: Record<string, Brawler>
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
  icon: number;
  metric: number;
}

export interface Leaderboard {
  metric: string
  entries: LeaderboardEntry[]
}
