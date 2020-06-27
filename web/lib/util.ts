// rebuild for frontend with ./node_modules/.bin/tsc lib/util.ts -m ESNext

import { MapMetaMap, ModeMetaMap } from "~/model/MetaEntry";

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
export const camelToKebab = (s: string) =>
  s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
export const capitalize = (str: string) => str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
export const capitalizeWords = (str: string) => str.split(' ').map(w => capitalize(w)).join(' ')

export function scaleMinMax(values: number[]) {
  const min = Math.min.apply(Math, values)
  const max = Math.max.apply(Math, values)

  if (min === max) {
    return values.map(value => 0.5)
  }

  return values.map(value => (value - min) / (max - min))
}

export function zip<T>(arr1: T[], arr2: T[]) {
  return arr1.map((value, index) => [value, arr2[index]])
}

export function hoursSinceDate(date: string) {
  const then = Date.parse(date)
  const now = (new Date()).getTime()
  return Math.floor((now - then) / 1000 / 3600)
}

export const brawlerId = (entry: { name: string }) =>
  entry.name.replace(/\.| /g, '_').toLowerCase();

export const modeToBackgroundId = (modeCamelCase: string) => {
  const mode = camelToSnakeCase(modeCamelCase);
  if (mode == 'big_game') {
    return 'bossfight';
  }
  if (mode.endsWith('showdown')) {
    return 'showdown';
  }
  return mode.replace('_', '');
}

export function formatMode(mode: string) {
  return camelToSnakeCase(mode)
    .split('_')
    .map(w => capitalize(w))
    .join(' ')
}

export function xpToHours(xp: number) {
  return xp / 220; // 145h for 30300 XP as measured by @schneefux
}

/**
 * Suffix num with SI unit
 * @param num number
 * @param digits digits after comma
 */
export function formatSI(num: number, digits: number) {
  const si = [
    { value: 1, symbol: '' },
    { value: 1E3, symbol: 'k' },
    { value: 1E6, symbol: 'M' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  let i
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
}

export const metaStatMaps = {
  labels: {
    trophies: 'Trophies',
    spTrophies: 'with Star Power',
    trophyChange: 'this season',
    winRate: '3v3 Win Rate',
    rank1Rate: 'SD Win Rate',
    level: 'Avg. Level',
    starRate: 'Star Player',
    pickRate: 'Pick Rate',
    pickRate_boss: 'Boss Pick Rate',
    duration: 'Duration',
    duration_boss: 'Boss Duration',
    rank: 'Avg. Rank',
    rank1: 'Wins recorded',
    wins: 'Wins recorded',
  },
  labelsShort: {
    trophies: 'Trophies',
    spTrophies: 'with Star Power',
    trophyChange: 'this season',
    winRate: 'Won',
    rank1Rate: 'SD Won',
    level: 'Level',
    starRate: 'Stars',
    pickRate: 'Picked',
    duration: 'Duration',
    rank: 'Rank',
    rank1: 'Rank 1',
    wins: 'Wins',
  },
  descriptions: {
    pickRate: 'The Pick Rate tells you the % of battles this Brawler appears in.',
    rank: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
    rank1Rate: 'The Showdown Win Rate tells you the % of Showdown battles a Brawler is #1.',
    wins: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
    winRate: 'The 3v3 Win Rate tells you the % of 3v3 battles this Brawler wins.',
    starRate: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
    trophies: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
    duration: 'The Duration tells you how long battles with this Brawler last on average.',
  },
  icons: {
    trophies: 'trophy',
    spTrophies: 'starpower',
    trophyChange: 'trophy',
    winRate: '📈',
    rank1Rate: '📈',
    level: '🏅',
    starRate: '⭐',
    pickRate: '👇',
    pickRate_boss: '👇',
    duration: '⏰',
    duration_boss: '⏰',
    rank: 'leaderboards',
    rank1: '🏅',
    wins: '🏅',
  },
  formatters: {
    trophies: (n: number) => Math.round(n),
    spTrophies: (n: number) => Math.round(n),
    trophyChange: (n: number) => n <= 0 ? Math.round(n) : `+${Math.round(n)}`,
    winRate: (n: number) => `${Math.round(100 * n)}%`,
    rank1Rate: (n: number) => `${Math.round(100 * n)}%`,
    starRate: (n: number) => `${Math.round(100 * n)}%`,
    pickRate: (n: number) => `${Math.round(100 * n)}%`,
    pickRate_boss: (n: number) => `${Math.round(100 * n)}%`,
    duration: (n: number) => `${Math.floor(n / 60)}:${Math.floor(n % 60).toString().padStart(2, '0')}`,
    duration_boss: (n: number) => `${Math.floor(n / 60)}:${Math.floor(n % 60).toString().padStart(2, '0')}`,
    rank: (n: number) => n === null ? 'N/A' : n.toFixed(2),
    level: (n: number) => n.toFixed(2),
    rank1: (n: number) => formatSI(n, 1),
    wins: (n: number) => formatSI(n, 1),
  },
  signs: {
    trophies: -1, // more is better -> sort rank desc
    spTrophies: -1,
    trophyChange: -1,
    winRate: -1,
    rank1Rate: -1,
    starRate: -1,
    pickRate: -1,
    pickRate_boss: -1,
    duration: +1, // asc
    duration_boss: +1,
    rank: +1,
    level: -1,
    rank1: -1,
    wins: -1,
  },
  propPriority: ['wins', 'rank1', 'duration', 'pickRate', 'winRate'],
}

/**
 * Get brawlers by event: {
 *  [eventId]: [
 *    brawler id,
 *    brawler name,
 *    brawler stats,
 *    sort prop
 *  ] }
 * sorted by the preferred prop according to propPriority
 */
export function getBest(meta: MapMetaMap|ModeMetaMap): { [key: string]: MetaGridEntrySorted[] } {
  return [...Object.entries(meta)]
    .reduce((top, [key, entry]) => ({
      ...top,
      [key]: [...Object.entries(entry.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          name: brawler.name,
          stats: brawler.stats,
          sampleSize: brawler.sampleSize,
          sortProp: <string>metaStatMaps.propPriority.find(prop => prop in brawler.stats),
        }))
        .sort((brawler1, brawler2) => brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp])
    }), {})
}

export function getMostPopular(meta: MapMetaMap|ModeMetaMap): { [key: string]: MetaGridEntrySorted[] } {
  return [...Object.entries(meta)]
    .reduce((top, [key, entry]) => ({
      ...top,
      [key]: [...Object.entries(entry.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          name: brawler.name,
          stats: brawler.stats,
          sampleSize: brawler.sampleSize,
          sortProp: 'pickRate',
        }))
        .sort((brawler1, brawler2) => brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp])
    }), {})
}

export interface MetaGridEntry {
  id: string
  title: string
  brawler: string // ID
  link?: string
  icon?: string
  sampleSize: number
  stats: {
    [name: string]: string|number
  }
}

export interface MetaGridEntrySorted extends MetaGridEntry {
  sortProp: string
}
