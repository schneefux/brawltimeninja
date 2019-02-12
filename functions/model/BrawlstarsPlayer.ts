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
