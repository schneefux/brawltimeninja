import { MetaGridEntry } from "~/lib/util";

export interface PlayerModeStats {
  picks: number
  winRate: number
  wins: number
  losses: number
}

// TODO enable @nuxt/content in tsconfig.json (currently buggy)
export interface Post {
  title: string
  author: string
  description: string
  order: number
  slug: string
  image?: string
}

export interface TierListEntry extends MetaGridEntry {
  id: string
  brawler: string
  title: string
  stats: {
    winRateAdj: number
  }
  link: string
}

export interface TierList {
  [tier: string]: TierListEntry[]
}
