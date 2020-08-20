export interface BrawlerMetaStatistics {
  name: string;
  sampleSize: number;
  stats: {
    [stat: string]: number;
  }
}

export interface PlayerModeStats {
  picks: number
  winRate: number
  wins: number
  losses: number
}
