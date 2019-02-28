import {
  PlayerIdentifier as WargamingPlayerIdentifier
} from './Wargaming';

interface Statistics {
  spotted: number;
  battles_on_stunning_vehicles: number;
  max_xp: number;
  avg_damage_blocked: number;
  direct_hits_received: number;
  explosion_hits: number;
  piercings_received: number;
  piercings: number;
  max_damage_tank_id: number|null;
  xp: number;
  survived_battles: number;
  dropped_capture_points: number;
  hits_percents: number;
  draws: number;
  max_xp_tank_id: number;
  battles: number;
  damage_received: number;
  avg_damage_assisted: number;
  max_frags_tank_id: number;
  avg_damage_assisted_track: number;
  frags: number;
  stun_number: number;
  avg_damage_assisted_radio: number;
  capture_points: number;
  stun_assisted_damage: number;
  max_damage: number;
  hits: number;
  battle_avg_xp: number;
  wins: number;
  losses: number;
  damage_dealt: number;
  no_damage_direct_hits_received: number;
  max_frags: number;
  shots: number;
  explosion_hits_received: number;
  tanking_factor: number;
}

export interface Player extends WargamingPlayerIdentifier {
  client_language: string;
  last_battle_time: number;
  created_at: number;
  updated_at: number;
  global_rating: number;
  clan_id: null|number;
  statistics: {
    clan: Statistics;
    all: Statistics;
    regular_team: Statistics;
    trees_cut: number;
    company: Statistics;
    stronghold_skirmish: Statistics;
    stronghold_defense: Statistics;
    historical: Statistics;
    team: Statistics;
    frags: null;
  }
  logout_at: number;
}

export interface Vehicle {
  statistics: {
    wins: number;
    battles: number;
  };
  mark_of_mastery: number;
  tank_id: number;
}

export interface Achievement {
  achievements: {
    medalCarius: number;
    invader: number;
    titleSniper: number;
    medalLavrinenko: number;
    armorPiercer: number;
    medalPoppel: number;
    sturdy: number;
    medalKay: number;
    handOfDeath: number;
    medalAbrams: number;
    medalLeClerc: number;
    medalKnispel: number;
    sniper: number;
  };
  frags: {
    crucialShotMedal: number;
    prematureDetonationMedal: number;
    sentinelMedal: number;
    infiltratorMedal: number;
    fightingReconnaissanceMedal: number;
    fireAndStellMedal: number;
    rangerMedal: number;
    reliableComrade: number;
    pyromaniacMedal: number;
    wolfAmongSheepMedal: number;
    heaveyFireMedal: number;
    bruteForceMedal: number;
    guerillaMedal: number;
    promisingFighterMedal: number;
    beasthunter: number;
    geniusForWarMedal: number;
    sinai: number;
    pattonValley: number;
  };
  max_series: {
    armorPiercer: number;
    aimer: number;
    titleSniper: number;
    tacticalBreakthrough: number;
    invincible: number;
    victoryMarch: number;
    deathTrak: number;
    EFC2016: number;
    diehard: number;
    WFC2014: number;
    handOfDeath: number;
  };
}
