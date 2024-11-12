export interface Brawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gears: {
    id: number;
    name: string;
    level: number;
  }[];
  starPowers: {
    id: number;
    name: string;
  }[];
  gadgets: {
    id: number;
    name: string;
  }[];
}

export interface Player {
  tag: string;
  name: string;
  nameColor: string|undefined;
  icon: {
    id: number;
  };
  trophies: number;
  highestTrophies: number;
  highestPowerPlayPoints: number;
  expLevel: number;
  expPoints: number;
  isQualifiedFromChampionshipChallenge: boolean;
  '3vs3Victories': number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  club?: {
    tag: string;
    name: string;
  };
  brawlers: Brawler[];
}

export interface Event {
  startTime: string;
  endTime: string;
  event: {
    id: number;
    mode: string;
    map: string;
  }
}

export interface BattlePlayer {
  tag: string;
  name: string;
  brawler: {
    id: number;
    name: string;
    power: number;
    trophies?: number; // type=tournament has no trophies
  } // showdown, bossfight
}

export interface BattlePlayerMultiple {
  tag: string;
  name: string;
  brawlers: {
    id: number;
    name: string;
    power: number;
    trophies?: number; // type=tournament has no trophies
    trophyChange: number;
  }[] // duels
}

export interface BattleLog {
  items: {
    battleTime: string;
    event: {
      id: number; // 0 for competition maps
      mode?: string; // removed 2020-10-22
      map: string|null; // null for competition maps
    }
    battle: {
      mode: string;
      type?: string; // ranked: regular, soloRanked: power league, tournament: ? club league?
      result?: string;
      duration?: number;
      rank?: number;
      trophyChange?: number;
      level?: {
        name: null;
        id: number;
      }; // bossfight
      starPlayer?: BattlePlayer;
      teams?: BattlePlayer[][]; // 3v3
      players?: BattlePlayer[]|BattlePlayerMultiple[]; // showdown, bossfight, duels
      bigBrawler?: BattlePlayer; // bossfight
    }
  }[]
  paging: {}
}

export interface ClubMember {
  tag: string
  name: string
  nameColor: string
  trophies: number
  role: string
  icon: {
    id: number
  }
}

export interface Club {
  tag: string
  name: string
  description: string
  type: string // 'open'
  badgeId: number
  requiredTrophies: number
  trophies: number
  members: ClubMember[]
}

export interface PlayerRanking {
  tag: string
  name: string
  nameColor: string
  icon: {
    id: number
  }
  trophies: number
  rank: number
  club?: {
    name: string
  }
}

export interface ClubRanking {
  tag: string
  name: string
  badgeId: number
  trophies: number
  rank: number
  memberCount: number
}

export interface DevfoxPlayerResponse {
  state: 0|1 // 0: success, 1: error
  tag: string // with hash
  response: {
    Heroes: {
      Character: number // Brawler ID
      Skin: number // selected skin ID
      Mastery: number // current Mastery points
    }[]
    Stats: {
      22: number // highest ranked
      23: number // current ranked
      24: number // current ranked points
      25: number // highest ranked points
      27: number // account creation year
      29: number // season highest trophies
      30: number // season prestige
    }
  }
}
