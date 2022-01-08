// data based on the Open Extended Jungian Type Scale https://openpsychometrics.org/tests/OJTS/development/
export interface OEJTSEntry {
  // negative/positive: how confident to the left/right dichitomy
  ie: number
  sn: number
  ft: number
  jp: number
}

// items with the largest mean level difference (dark red)
// selecting top 10 that are easiest to translate
const oejtsScores = <Record<string, OEJTSEntry>>{
  organizedChaotic: {
    ie: +0.16,
    sn: +0.21,
    ft: -0.25,
    jp: +1.15,
  },
  artisticScientific: {
    ie: -0.21,
    sn: +0.31,
    ft: +1.08,
    jp: -0.42,
  },
  /*
  compassionJustice: {
    ie: -0.16,
    sn: -0.02,
    ft: +1.32,
    jp: -0.39,
  },
  */
  bounceCalm: {
    ie: -1.31,
    sn: +0.03,
    ft: +0.44,
    jp: -0.50,
  },
  /*
  caresGoodBad: {
    ie: -0.19,
    sn: +0.14,
    ft: +1.12,
    jp: -0.12,
  },
  */
  /*
  hurtThickSkinned: {
    ie: +0.22,
    sn: +0.08,
    ft: +1.10,
    jp: -0.08,
  },
  */
  /*
  energeticMellow: {
    ie: -1.24,
    sn: +0.11,
    ft: +0.15,
    jp: +0.05,
  },
  */
  /*
  enthusiasticDeliberate: {
    ie: -1.17,
    sn: -0.04,
    ft: +0.80,
    jp: -0.53,
  },
  */
  /*
  yellLoudly: {
    ie: +1.40,
    sn: -0.11,
    ft: -0.05,
    jp: +0.18,
  },
  */
  heartHead: {
    ie: -0.36,
    sn: +0.01,
    ft: +1.60,
    jp: -0.45,
  },
  friendlyDistant: {
    ie: -1.26,
    sn: +0.27,
    ft: +0.74,
    jp: -0.13,
  },
  partyWornOut: {
    ie: +1.77,
    sn: -0.20,
    ft: -0.21,
    jp: +0.35,
  },
  photographHateLove: {
    ie: +1.06,
    sn: -0.25,
    ft: -0.44,
    jp: +0.21,
  },
  leadFrontBehindScenes: {
    ie: -1.16,
    sn: +0.27,
    ft: +0.29,
    jp: +0.09,
  },
  /*
  performPublicSpeak: {
    ie: -1.41,
    sn: -0.10,
    ft: +0.04,
    jp: -0.05,
  },
  */
  listenTalk: {
    ie: +1.37,
    sn: -0.06,
    ft: -0.09,
    jp: +0.23,
  },
  /*
  needBoredAlone: {
    ie: +1.44,
    sn: -0.18,
    ft: -0.18,
    jp: +0.22,
  },
  */
  /*
  openGuarded: {
    ie: -1.41,
    sn: +0.04,
    ft: +0.67,
    jp: -0.33,
  },
  */
  /*
  peopleOrientedTaskOriented: {
    ie: -1.23,
    sn: -0.07,
    ft: +1.10,
    jp: -0.57,
  },
  */
  /*
  farAheadLastMinute: {
    ie: +0.30,
    sn: -0.04,
    ft: -0.29,
    jp: +1.26,
  },
  */
  preparesImprovises: {
    ie: +0.43,
    sn: +0.28,
    ft: -0.15,
    jp: +1.43,
  },
  /*
  scepticalBeliever: {
    ie: +0.46,
    sn: +0.18,
    ft: -1.17,
    jp: +0.18,
  },
  */
  /*
  scheduledSpontaneous: {
    ie: +0.57,
    sn: +0.34,
    ft: -0.35,
    jp: +1.17,
  },
  */
  /*
  clarityHarmony: {
    ie: +0.16,
    sn: -0.17,
    ft: -1.05,
    jp: +0.34,
  },
  */
  /*
  sentimentalGrim: {
    ie: -0.40,
    sn: +0.28,
    ft: +1.07,
    jp: -0.13,
  },
  */
  /*
  somberEnthusiastic: {
    ie: +1.33,
    sn: -0.02,
    ft: -0.54,
    jp: +0.31,
  },
  */
  /*
  stayHomeGoOut: {
    ie: +1.43,
    sn: -0.05,
    ft: -0.18,
    jp: +0.26,
  },
  */
  stickPlanAdapt: {
    ie: +0.49,
    sn: +0.40,
    ft: -0.12,
    jp: +1.07,
  },
  /*
  roboticMechanical: {
    ie: -0.45,
    sn: -0.02,
    ft: +1.21,
    jp: -0.41,
  },
  */
  reasonInstinct: {
    ie: +0.37,
    sn: +0.33,
    ft: -1.17,
    jp: +0.45,
  },
  emotions: {
    ie: -0.55,
    sn: +0.03,
    ft: +1.67,
    jp: -0.22,
  },
  respectLove: {
    ie: +0.22,
    sn: -0.37,
    ft: -1.18,
    jp: +0.40,
  },
  /*
  fixingThingsPeople: {
    ie: +0.40,
    sn: -0.04,
    ft: -1.28,
    jp: +0.10,
  },
  */
  /*
  believeSceptical: {
    ie: -0.39,
    sn: +0.17,
    ft: +1.10,
    jp: -0.16,
  },
  */
  aloneGroup: {
    ie: +1.19,
    sn: -0.09,
    ft: -0.33,
    jp: +0.21,
  },
}

// based on community votes

const brawlerScores = <Record<string, OEJTSEntry>>{
  COLT: {
    ie: +1.00,
    sn: -1.00,
    ft: +0.92,
    jp: +0.95,
  },
  SHELLY: {
    ie: +1.00,
    sn: -1.00,
    ft: +1.00,
    jp: -0.92,
  },
  '8-BIT': {
    ie: -0.64,
    sn: +1.00,
    ft: +1.00,
    jp: +0.55,
  },
  AMBER: {
    ie: +0.94,
    sn: -0.78,
    ft: -1.00,
    jp: +0.78,
  },
  BARLEY: {
    ie: -0.93,
    sn: -0.97,
    ft: -0.97,
    jp: -0.97,
  },
  BEA: {
    ie: +1.00,
    sn: +1.00,
    ft: -0.93,
    jp: -0.79,
  },
  BELLE: {
    ie: +0.70,
    sn: +0.70,
    ft: +0.90,
    jp: -0.80,
  },
  BIBI: {
    ie: +0.76,
    sn: -1.00,
    ft: +0.59,
    jp: +0.94,
  },
  BO: {
    ie: -0.96,
    sn: +0.83,
    ft: -0.83,
    jp: -0.78,
  },
  BROCK: {
    ie: +0.93,
    sn: -1.00,
    ft: +0.87,
    jp: +1.00,
  },
  BULL: {
    ie: +0.61,
    sn: -1.00,
    ft: +1.00,
    jp: +0.83,
  },
  BYRON: {
    ie: 0.00,
    sn: +0.96,
    ft: +0.96,
    jp: -1.00,
  },
  CARL: {
    ie: +0.73,
    sn: +1.00,
    ft: +0.95,
    jp: +1.00,
  },
  COLETTE: {
    ie: +0.95,
    sn: +0.91,
    ft: -0.91,
    jp: +0.95,
  },
  'COLONEL RUFFS': {
    ie: +0.88,
    sn: +0.75,
    ft: +0.88,
    jp: -0.88,
  },
  CROW: {
    ie: -0.94,
    sn: -0.59,
    ft: +1.00,
    jp: +0.62,
  },
  DARRYL: {
    ie: +0.65,
    sn: +0.80,
    ft: -0.75,
    jp: +1.00,
  },
  DYNAMIKE: {
    ie: +1.00,
    sn: -1.00,
    ft: +0.73,
    jp: +0.91,
  },
  EDGAR: {
    ie: -0.88,
    sn: -1.00,
    ft: -1.00,
    jp: +0.88,
  },
  'EL PRIMO': {
    ie: +1.00,
    sn: -1.00,
    ft: -1.00,
    jp: +0.90,
  },
  EMZ: {
    ie: +1.00,
    sn: -1.00,
    ft: -0.93,
    jp: +1.00,
  },
  FRANK: {
    ie: -1.00,
    sn: -1.00,
    ft: +0.79,
    jp: -0.64,
  },
  GALE: {
    ie: -1.00,
    sn: -1.00,
    ft: -0.92,
    jp: -1.00,
  },
  GENE: {
    ie: +0.82,
    sn: +0.94,
    ft: -1.00,
    jp: +1.00,
  },
  JACKY: {
    ie: +0.92,
    sn: -1.00,
    ft: +1.00,
    jp: -0.75,
  },
  JESSIE: {
    ie: +0.91,
    sn: +0.95,
    ft: +0.68,
    jp: +1.00,
  },
  TICK: {
    ie: +0.86,
    sn: +0.93,
    ft: +0.79,
    jp: +1.00,
  },
  LEON: {
    ie: -0.68,
    sn: -0.71,
    ft: +0.68,
    jp: +0.97,
  },
  LOU: {
    ie: +0.71,
    sn: -0.79,
    ft: -1.00,
    jp: -0.79,
  },
  MAX: {
    ie: +1.00,
    sn: -0.94,
    ft: +0.56,
    jp: +1.00,
  },
  MORTIS: {
    ie: +0.67,
    sn: +1.00,
    ft: +0.96,
    jp: +0.67,
  },
  'MR. P': {
    ie: +0.92,
    sn: -0.77,
    ft: +1.00,
    jp: -1.00,
  },
  NANI: {
    ie: -0.91,
    sn: -0.91,
    ft: -0.91,
    jp: -0.91,
  },
  NITA: {
    ie: -0.89,
    sn: -0.74,
    ft: -1.00,
    jp: +1.00,
  },
  PAM: {
    ie: +0.92,
    sn: -1.00,
    ft: -0.85,
    jp: -0.92,
  },
  PENNY: {
    ie: +0.88,
    sn: -0.94,
    ft: +0.94,
    jp: +0.75,
  },
  PIPER: {
    ie: +0.95,
    sn: -0.70,
    ft: -1.00,
    jp: -1.00,
  },
  POCO: {
    ie: +0.92,
    sn: +0.60,
    ft: -0.92,
    jp: -0.60,
  },
  RICO: {
    ie: +0.70,
    sn: +0.65,
    ft: +0.95,
    jp: -0.90,
  },
  ROSA: {
    ie: -0.85,
    sn: +0.73,
    ft: +0.77,
    jp: +0.88,
  },
  SANDY: {
    ie: -0.97,
    sn: +0.97,
    ft: +0.70,
    jp: +1.00,
  },
  SPIKE: {
    ie: +0.70,
    sn: +0.95,
    ft: -1.00,
    jp: +0.95,
  },
  SPROUT: {
    ie: -1.00,
    sn: -0.62,
    ft: +0.67,
    jp: -0.62,
  },
  SQUEAK: {
    // TODO
    ie: -0.75,
    sn: +0.75,
    ft: -1.00,
    jp: +1.00,
  },
  STU: {
    // TODO
    ie: +0.80,
    sn: +0.80,
    ft: -0.80,
    jp: +1.00,
  },
  SURGE: {
    // TODO
    ie: +1.00,
    sn: -1.00,
    ft: +1.00,
    jp: +1.00,
  },
  TARA: {
    ie: -1.00,
    sn: +0.94,
    ft: +0.94,
    jp: -0.81,
  },
}

export { oejtsScores, brawlerScores }
