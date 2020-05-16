// rebuild for frontend with ./node_modules/.bin/tsc lib/util.ts -m ESNext

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

export function induceAdsIntoArray(array: any[], adSlots: any[], adFrequency: number) {
  return array.reduce((agg, element, index, self) => {
    const lastSlotIndex = Math.floor(index / adFrequency) + 1
    if (index === self.length - 1 && lastSlotIndex < adSlots.length) {
      const ad = {
        adSlot: adSlots[lastSlotIndex],
        id: 'ad-last',
      }
      return agg.concat(element, ad)
    }

    const slotIndex = Math.floor(index / adFrequency)
    if (index % adFrequency === adFrequency - 1 && slotIndex < adSlots.length) {
      const ad = {
        adSlot: adSlots[slotIndex],
        id: `ad-${index}`,
      }
      return agg.concat(ad, element)
    }

    return agg.concat(element)
  }, [])
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
    rank1: (n: number) => n,
    wins: (n: number) => n,
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
export function getBestByEvent(mapMeta: any[]) {
  return [...Object.entries(mapMeta)]
    .reduce((top5, [eventId, entry]) => ({
      ...top5,
      [eventId]: [...Object.entries(<any[]>entry.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          name: brawler.name,
          stats: brawler.stats,
          sortProp: <string>metaStatMaps.propPriority.find(prop => prop in brawler.stats),
        }))
        .sort((brawler1, brawler2) => brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp])
    }), {})
}
