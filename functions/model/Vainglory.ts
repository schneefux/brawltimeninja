export interface ResponseCollection<T, U> {
  data: T[];
  included: U[];
}

export interface EntityRelation {
  type: string;
  id: string;
}

export interface Entity extends EntityRelation {
  attributes: {};
  relationships: {};
}

export interface Player extends Entity {
  attributes: {
    createdAt: string;
    patchVersion: string;
    shardId: string;

    name: string;
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
    };
  };
}

export interface Participant extends Entity {
  attributes: {
    actor: string;
    stats: {
      kills: number;
      assists: number;
      deaths: number;
      farm: number;
      wentAfk: boolean;
      winner: boolean;
    };
  };
  relationships: {
    player: {
      data: EntityRelation;
    };
  };
}

export interface Roster extends Entity {
  attributes: {
  };
}

export interface Match extends Entity {
  attributes: {
    createdAt: string;
    patchVersion: string;

    duration: number;
    gameMode: string;
    stats: {
      endGameReason: string;
      queue: string;
    };
  };

  relationships: {
    assets: {
      data: EntityRelation[];
    };
    rosters: {
      data: EntityRelation[];
    };
  };
}
