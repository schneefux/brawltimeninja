export interface Id {
    high: number;
    low: number;
}

export interface Brawler {
    name: string;
    hasSkin: boolean;
    skin: string;
    trophies: number;
    highestTrophies: number;
    level: number;
}

export interface ClientOptions {
    token: string;
}

export interface TopPlayerOptions {
    brawler: string;
    count: number;
}

export class Client {
    constructor(options: ClientOptions);
    about(): Promise<any>;
    clubSearch(query: string): Promise<Club[]>;
    getClub(tag: string): Promise<Club>;
    getCurrentEvents(): Promise<any>;
    getEndpoints(): Promise<string[]>;
    getMisc(): Promise<any>;
    getPlayer(tag: string): Promise<Player>;
    getTopClubs(count: number): Promise<Club[]>;
    getTopPlayers(options: TopPlayerOptions): Promise<Player[]>;
    getUpcomingEvents(): Promise<any>;
}

export class Club {
    constructor();
    toJSON(): string;
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

export class Player {
    constructor(...args: any[]);
    getClub(): Promise<Club>;
    toJSON(): string;
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
    bestTimeAsBoss: string;
    bestRoboRumbleTime: string;
    hasSkins: boolean;
    club: Club;
}

export const version: string;

export namespace utils {
    const validChars: string[];
    function clean(tag: string): string;
    function validate(tag: string): boolean;
}

