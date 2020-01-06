export interface MetaBrawlerEntry {
  name: string;
  trophies: number;
  winRate: number;
  starRate: number;
  picks: number;
  trophyChange: number;
}

export interface MetaStarpowerEntry {
  id: number;
  brawlerName: string;
  starpowerName: string;
  winRate: number;
  starRate: number;
  rank1Rate: number;
  picks: number;
}

export interface MetaModeEntry {
  name: string;
  mode: string;
  picks: number;
  winRate: number;
  duration: number;
  rank1Rate: number;
  rank: number;
  starRate: number;
}

export interface PlayerMetaModeEntry {
  mode: string;
  picks: number;
  winRate: number;
  duration: number;
  rank1Rate: number;
  rank: number;
  starRate: number;
  trophyChange: number;
}

export interface MetaMapEntry {
  id: number;
  mode: string;
  map: string;
  name: string;
  isBigbrawler: number;
  level: number;
  duration: number;
  rank1: number;
  rank: number;
  wins: number;
  starRate: number;
  picks: number;
}
