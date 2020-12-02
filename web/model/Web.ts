import { IContentDocument } from "@nuxt/content/types/content";
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
    winsZScore: number
  }
  link: string
}

export interface TierList {
  [tier: string]: TierListEntry[]
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
