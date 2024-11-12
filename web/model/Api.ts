import { Player as BrawlstarsPlayer } from "./Brawlstars"

export interface StarPower {
  id: number
  name: string
}

export interface Gadget extends StarPower {
}

export interface Gear extends StarPower {
  level: number
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

export interface LeagueRank {
  league: 'Bronze'|'Silver'|'Gold'|'Diamond'|'Mythic'|'Legendary'|'Masters',
  leagueSub: 'I'|'II'|'III',
  formatted: string,
}

export interface Battle {
  timestamp: Date;
  ranked: boolean;
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
    brawlerRank: undefined|LeagueRank;
    isBigbrawler: boolean;
  }[][]
}

export interface Player extends Omit<BrawlstarsPlayer, 'brawlers'> {
  brawlers: Record<string, Brawler>
  battles: Battle[]
}

export interface LeagueRankWithPoints extends LeagueRank {
  points: number
}

export interface PlayerExtra {
  rank: LeagueRankWithPoints
  highestRank: LeagueRankWithPoints
  accountCreationYear: number
  brawlers: Record<string, BrawlerExtra>
}

export interface BrawlerExtra {
  masteryPoints: number
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

export interface ClubActivityStatistics {
  lastActive: Record<string, Date|undefined>
  commonBattles: Battle[]
  battlesByMode: Record<string, number>
}
