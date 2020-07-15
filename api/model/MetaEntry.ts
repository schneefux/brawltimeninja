export interface MetaBrawlerEntry {
  name: string;
  winRate: number;
  starRate: number;
  picks: number;
}

export interface MetaStarpowerEntry {
  brawlerId: number;
  brawlerName: string;
  starpowerId: number;
  starpowerName: string;
  winRate: number;
  starRate: number;
  rank1Rate: number;
  picks: number;
}

export interface MetaGadgetEntry {
  brawlerId: number;
  brawlerName: string;
  gadgetId: number;
  gadgetName: string;
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

export interface MetaMapEntry extends MetaModeEntry {
  id: number;
  map: string;
  isBigbrawler: number;
  level: number;
}

export interface BrawlerMetaEntry {
  id: string;
  name: string;
  sampleSize: number;
  stats: {
    [stat: string]: number;
  }
}

export interface Map {
  map: string;
  mode: string;
  sampleSize: number;
}

export interface ModeMeta {
  mode: string;
  sampleSize: number;
  brawlers: {
    [brawler: string]: {
      name: string;
      sampleSize: number;
      stats: {
        [stat: string]: number;
      }
    }
  }
}

export interface StarpowerMetaEntry {
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

export interface GadgetMetaEntry {
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

export interface MapMeta extends ModeMeta {
  map: string;
}

export interface MapMetaMap {
  [event: string]: MapMeta;
}

export interface ModeMetaMap {
  [event: string]: ModeMeta;
}

export interface MapMap {
  [event: string]: Map;
}
