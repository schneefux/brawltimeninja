export interface VaingloryPlayer {
  type: string;
  id: string;
  attributes: {
    createdAt: string;
    name: string;
    patchVersion: string;
    shardId: string;
    stats: {
      gamesPlayed: {
        [mode: string]: number;
      };
      guildTag: string;
      karmaLevel: number;
      level: number;
      rankPoints: {
        [mode: string]: number;
      };
      skillTier: number;
      wins: number;
      xp: number;
    }
  }
}
