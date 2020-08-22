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

export interface PlayerModeStats {
  picks: number
  winRate: number
  wins: number
  losses: number
}

// TODO enable @nuxt/content in tsconfig.json (currently buggy)
export interface Post {
  title: string
  author: string
  description: string
  order: number
  slug: string
  image?: string
}
