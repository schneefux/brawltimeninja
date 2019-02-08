export interface VaingloryOptions {
  host?: string;
  title?: string;
  region?: string;
}

export default class Vainglory {
  constructor(token: string, options?: VaingloryOptions);
  region(region: string): Vainglory;
  setRegion(region: string): void;
  models: any[];
  matches: {
    collection: Promise<any>;
    single: Promise<any>;
  }
  players: {
    getById(id: string): Promise<any>;
    getByName(names: string[]): Promise<any>;
  }
  status(): Promise<any>;
}