export interface BrawlerMetaStatistics {
  name: string;
  sampleSize: number;
  stats: {
    [stat: string]: number;
  }
}
