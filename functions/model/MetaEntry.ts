export interface MetaEntry {
  name: string;
  trophies: number;
  spTrophies: number;
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
  duration: number;
  rank: number;
  wins: number;
  stars: number;
  picks: number;
}
