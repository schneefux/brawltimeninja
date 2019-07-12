export interface Id {
    high: number;
    low: number;
}

export interface Brawler {
    name: string;
    hasSkin: boolean;
    skin: string|null;
    trophies: number;
    highestTrophies: number;
    power: number;
    rank: number;
}

export interface Club {
    id: Id;
    tag: string;
    name: string;
    role: string;
    badgeId: number;
    badgeUrl: string;
    members: number;
    trophies: number;
    requiredTrophies: number;
    onlineMembers: number;
}

export interface Player {
    tag: string;
    id: Id;
    name: string;
    brawlersUnlocked: number;
    brawlers: Brawler[];
    victories: number;
    soloShowdownVictories: number;
    duoShowdownVictories: number;
    totalExp: number;
    expFmt: string;
    expLevel: number;
    trophies: number;
    highestTrophies: number;
    avatarId: number;
    avatarUrl: string;
    bestTimeAsBigBrawler: string;
    bestRoboRumbleTime: string;
    hasSkins: boolean;
    club: Club|null;
}

export interface Event {
  slot: number;
  slotName: string;
  startTimeInSeconds: number;
  startTime: string;
  endTimeInSeconds: number;
  endTime: string;
  freeKeys: number;
  mapId: number;
  mapName: string;
  mapImageUrl: string;
  gameMode: string;
  hasModifier: boolean;
  modifierId: number;
  modifierName: string;
}

export interface BattlePlayer {
  tag: string;
  name: string;
  brawler: {
    id: number;
    name: string;
    power: number;
    trophies: number;
  }
}

export interface BattleLog {
  items: {
    battleTime: string;
    event: {
      id: number;
      mode: string;
      map: string;
    }
    battle: {
      mode: string;
      type?: string;
      result?: string;
      duration?: number;
      rank?: number;
      trophyChange?: number;
      starPlayer?: BattlePlayer;
      teams: BattlePlayer[][]; // 3v3
      players: BattlePlayer[]; // showdown, bossfight
      bigBrawler: BattlePlayer; // bossfight
    }
  }[]
  paging: {}
}
