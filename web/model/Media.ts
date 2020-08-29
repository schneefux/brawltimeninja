interface Skill {
  cooldown: number
  rechargeTime: number
  damage: number|null
  description: string
  damageLabel: string
  range: number|null
  charges: number|null
  spread: number|null
}

export interface BrawlerData {
  scId: number
  name: string
  id: string
  speed: number
  health: number
  offenseRating: number
  defenseRating: number
  utilityRating: number
  description: string

  main: Skill
  super: Skill

  starpowerDescriptions: {
    [key: string]: string
  }
  gadgetDescriptions: {
    [key: string]: string
  }
}

// from the game files

export interface DataCard {
  name: string // internal name
  target: string // internal character name
  rarity: string // 'common'
  tID: string // 'BUCKSHOT'
  powerNumberTID: string // 'Damage per shell'
  value: null|number
  value2: null|number
  value3: null|number
  rawTID: string // 'LONG_RANGE_SHOTGUN', 'MEGA_BLASH_ULTI'
  type: string // 'medikit' (starpower), 'accessory' (gadget)
  iconExportName: string|null // 'icon_item_shelly_2' for gadgets
  // ...and more...
}

export interface DataSkill {
  name: string // internal name
  behaviorType: string // 'Attack' or 'Charge' (Super)
  canAutoShoot: boolean,
  cooldown: number // *2 for ms
  rechargeTime: number // ms
  damage: number|null // per bullet, *1.4 for max level
  activeTime: number|null
  msBetweenAttacks: number
  castingRange: number|null // /3 for tiles/s
  numBulletsInOneAttack: number|null
  maxCharge: number|null
  spread: number|null // /2 for deg
  // ...and more...
}

export interface DataCharacter {
  name: string // internal name, prefix of skills
  itemName: string|null // lower case, no space
  tID: string // upper case, with space
  speed: number // /300 for tiles/s
  hitpoints: number // multiply by 1.4 for max level
  autoAttackSpeedMs: number|null
  autoAttackDamage: number|null
  autoAttackRange: number
  ultiChargeMul: number
  ultiChargeUltiMul: number
  type: string // 'Hero', minion, ...
  offenseRating: number // 1..5
  defenseRating: number
  utilityRating: number
  scId: number
  rawTID: string
  // ...and more...
}
