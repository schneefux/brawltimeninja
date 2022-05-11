export interface PlayerModeStats {
  picks: number
  winRate: number
  wins: number
  losses: number
}

export interface TocEntry {
  title: string
  createdAt: string
  description: string
  slug: string
  image?: string
  author: string
}

export interface BrawlerContent {
  name?: string
  gender: string
  description?: string
  main?: string
  super?: string
  starpowers?: {
    name: string
    description: string
  }[]
  gadgets?: {
    name: string
    description: string
  }[]
}

export interface ScrapedAccessory {
  name: string
  description: string
  id: string
}

interface ScrapedAttack {
  name: string
  description: string
  stats: {
    attackrange: string
    reload: string
    attackbullets: string
    attacksupercharge: string
    attackspread: string
    attackspeed: string
    stats: Record<string, string>
  }
  statsByLevel: {
    name: string
    list: number[]
  }[]
}

export interface ScrapedBrawler {
  url: string
  name: string
  description: string
  stats: {
    rarity: string
    class: string
    movementspeed: string
    voiceactor: string
  }
  healthByLevel: number[]
  gadgets: ScrapedAccessory[]
  starpowers: ScrapedAccessory[]
  tips: string[]
  voicelines: {
    name: string
    description: string
    link: string
    path: string
  }[]
  attack: ScrapedAttack
  super: ScrapedAttack
  model: {
    link: string
    path: string
  }
  avatar: {
    link: string
    path: string
  }
  skins: {
    name: string
    skins: {
      name: string
      link: string
      path: string
      cost?: string
      campaign?: string
    }[]
  }[]
  pins: {
    name: string
    link: string
    path: string
  }[]
  history: {
    date: string
    description: string
    type: 'Nerf'|'Neutral'|'Buff'
  }[]
}
