export interface MetaEntry {
  name: string;
  trophies: number;
  winRate: number;
  starRate: number;
  picks: number;
  trophyChange: number;
}

export interface MetaModeEntry {
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
