export interface PlayerStub {
  uid: string;
  username: string;
  platforms: string[];
  seasons: string[];
}

interface Stats {
  placetop1: number;
  placetop3?: number;
  placetop5?: number;
  placetop6?: number;
  placetop10?: number;
  placetop12?: number;
  placetop25?: number;
  kills: number;
  playersoutlived?: number;
  matchesplayed?: number;
  minutesplayed?: number;
  score?: number;
  lastmodified?: number;
  includedPlaylists?: string[];
}

export interface Player {
  accountId: string;
  fnApiId: number;
  epicName: string;
  seasonWindow: string;
  devices: string[];
  data: {
    [device: string]: {
      [mode: string]: {
        [queue: string]: Stats
      };
    };
  };
  overallData: {
    [modes: string]: Stats
  }
}
