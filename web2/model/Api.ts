import { Player as BrawlstarsPlayer } from "./Brawlstars"

export interface StarPower {
  id: number
  name: string
}

export interface Gadget extends StarPower {
}

export interface Gear extends StarPower {
}

export interface Brawler {
  name: string;
  trophies: number;
  highestTrophies: number;
  power: number;
  rank: number;
  starPowers: StarPower[];
  gadgets: Gadget[];
  gears: Gear[];
}

export interface Battle {
  timestamp: Date;
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
  brawlers: Record<string, Brawler>
  battles: Battle[]
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
