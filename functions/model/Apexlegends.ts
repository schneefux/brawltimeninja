export const Characters = [
  'Bloodhound',
  'Gibraltar',
  'Lifeline',
  'Pathfinder',
  'Wraith',
  'Bangalore',
  'Caustic',
  'Mirage',
];

export interface DailyStat {
  kills: number;
  headshots: number;
  matches: number;
  damage: number;
}

export interface PlayerStub {
  aid: string;
  name: string;
  platform: string;
  avatar: string;
  legend: string;
  level: string;
  kills: string;
}

export interface Player extends PlayerStub {
  playerfound: boolean;
  skillratio: number;
  visits: string;
  headshots: string;
  matches: string;
  damage: string;
  lastdata: null;

  kills_Bloodhunt: string;
  kills_Gibraltar: string;
  kills_Lifeline: string;
  kills_Pathfinder: string;
  kills_Wraith: string;
  kills_Bangalore: string;
  kills_Caustic: string;
  kills_Mirage: string;

  headshots_Bloodhound: string;
  headshots_Gibraltar: string;
  headshots_Lifeline: string;
  headshots_Pathfinder: string;
  headshots_Wraith: string;
  headshots_Bangalore: string;
  headshots_Caustic: string;
  headshots_Mirage: string;

  matches_Bloodhound: string;
  matches_Gibraltar: string;
  matches_Lifeline: string;
  matches_Pathfinder: string;
  matches_Wraith: string;
  matches_Bangalore: string;
  matches_Caustic: string;
  matches_Mirage: string;

  damage_Bloodhound: string;
  damage_Gibraltar: string;
  damage_Lifeline: string;
  damage_Pathfinder: string;
  damage_Wraith: string;
  damage_Bangalore: string;
  damage_Caustic: string;
  damage_Mirage: string;

  globalrank: string;
  utime: string;
  daily_stats: { [time: number]: DailyStat };
}