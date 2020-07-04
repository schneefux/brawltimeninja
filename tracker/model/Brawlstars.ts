import { StarlistMap } from "./Starlist";

export interface Brawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
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
  nameColor: string;
  trophies: number;
  highestTrophies: number;
  powerPlayPoints: number;
  highestPowerPlayPoints: number;
  expLevel: number;
  expPoints: number;
  isQualifiedFromChampionshipChallenge: boolean;
  '3vs3Victories': number;
  soloVictories: number;
  duoVictories: number;
  bestRoboRumbleTime: number;
  bestTimeAsBigBrawler: number;
  club: null | {
    tag: string;
    name: string;
  };
  brawlers: Brawler[];
}

export interface Event {
  slot: {
    id: number;
    name: string;
    hash: string;
    listAlone: boolean;
    background: string|null;
  };
  startTime: string;
  endTime: string;
  reward: number;
  map: StarlistMap;
  modifier: null; // TODO
}

export interface ActiveEvent {
  id: string;
  map: string;
  mode: string;
  start: string;
  end: string;
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
      level: {
        name: null;
        id: number;
      }; // bossfight
      starPlayer?: BattlePlayer;
      teams: BattlePlayer[][]; // 3v3
      players: BattlePlayer[]; // showdown, bossfight
      bigBrawler: BattlePlayer; // bossfight
    }
  }[]
  paging: {}
}
