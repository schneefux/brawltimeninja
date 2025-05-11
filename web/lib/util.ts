import { Player } from "~/model/Api";
import { parseISO } from "date-fns";
import { MapMetaMap, ModeMetaMap } from "~/model/MetaEntry";

export const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
export const camelToKebab = (s: string) => {
  const kebab = s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

  if (s.endsWith('5V5')) {
    return kebab.replace('5-v5', '-5v5');
  }
  return kebab;
}
export const kebabToCamel = (s: string) => {
  const camel = s.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase()
    .replace('-', '')
    .replace('_', ''))

  if (s.endsWith('-5v5')) {
    return camel.replace('-5v5', '5V5');
  }
  return camel;
}

export const capitalize = (str: string) => str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
export const decapitalizeFirstLetter = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)
export const capitalizeWords = (str: string) => str.replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())

export const slugify = (str: string) => str.replace(/-/g, '--').replace(/ /g, '-')
export const deslugify = (str: string) => str.replace(/-/g, ' ').replace(/  /g, '-')

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
  entry.name.replace(/\.| |&/g, '_').toLowerCase()

export function formatMode(mode: string) {
  return camelToSnakeCase(mode)
    .split('_')
    .map(w => capitalize(w))
    .join(' ')
}

export function unformatMode(mode: string) {
  const uncapitalize = (str: string) => str.replace(/(?:^|\s)\S/g, (a) => a.toLowerCase())
  return uncapitalize(mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join(''))
}

export const formatList = (l: string[], joiner = 'or') => l.slice(0, l.length - 1).join(', ') + ' ' + joiner + ' ' + l[l.length - 1]
export const clamp = (min: number, max: number, n: number) => Math.min(max, Math.max(min, n))
export const minMaxScale = (fromMin: number, fromMax: number, n: number) => (n - fromMin) / (fromMax - fromMin)
export const scaleInto = (fromMin: number, fromMax: number, toMax: number, n: number) => clamp(0, toMax, Math.floor(minMaxScale(fromMin, fromMax, n) * toMax))

export function xpToHours(xp: number) {
  return xp / 220; // 145h for 30300 XP as measured by @schneefux
}

/**
 * Suffix num with SI unit
 * @param num number
 * @param digits total digits to show
 */
export function formatSI(num: number, digits: number = 3) {
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

  const siNum = num / si[i].value
  const siNumDigits = Math.floor(siNum).toString().length
  const number = parseFloat(siNum
    .toFixed(Math.max(0, digits - siNumDigits))
    .replace(rx, '$1'))
  const symbol = si[i].symbol

  return {
    number,
    symbol,
    formatted: number + symbol,
  }
}

const propPriority = ['winRateAdj', 'winRate', 'wins', 'rank1', 'duration', 'useRate', 'pickRate']

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
export function getBest(meta: MapMetaMap|ModeMetaMap): { [key: string]: unknown[] } {
  return [...Object.entries(meta)]
    .reduce((top, [key, entry]) => ({
      ...top,
      [key]: [...Object.entries(entry.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: brawler.name,
          brawler: brawlerId,
          sampleSize: brawler.sampleSize,
          stats: brawler.stats,
          sortProp: <string>propPriority.find(prop => prop in brawler.stats),
        }))
        .sort((brawler1, brawler2) => brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp])
    }), {})
}

export function getBestBrawlers(brawlers: any[]): any[] {
  const sampleSizeThreshold = 300
  brawlers = brawlers.filter(brawler => brawler.sampleSize >= sampleSizeThreshold)
  if (brawlers.length == 0) {
    return []
  }
  const sortProp = <string>propPriority.find(prop => prop in brawlers[0].stats)
  brawlers.sort((brawler1, brawler2) => brawler2.stats[sortProp] - brawler1.stats[sortProp])
  return brawlers
}

export function sloppyParseFloat(number: string) {
  return Math.floor(parseFloat(number) * 10000) / 10000
}

/**
 * Throw if a tag is invalid.
 * Make sure tag starts with a hash.
 */
export function validateTag(tag: string) {
  if (!tagPattern.test(tag)) {
    throw new Error('Invalid tag ' + tag)
  }
  if (!tag.startsWith('#')) {
    return '#' + tag
  }
  return tag
}

// in clickhouse SQL (tag has to start with '#'):
/*
arraySum((c, i) -> (position('0289PYLQGRJCUV', c)-1)*pow(14, length(player_club_tag)-i-1-1), arraySlice(splitByString('', player_club_tag), 2), range(if(player_club_tag <> '', toUInt64(length(player_club_tag)-1), 0))) as player_club_id,
*/

/**
 * Encode tag string into 64bit unsigned integer string.
 * TODO: Use BigInt if tags are >2^53 at some point.
 */
export function tagToId(tag: string) {
  if (!tagPattern.test(tag)) {
    throw new Error('Cannot encode tag ' + tag)
  }
  if (tag.startsWith('#')) {
    tag = tag.substring(1)
  }

  const result = tag.split('').reduce((sum, c) => sum*14 + '0289PYLQGRJCUV'.indexOf(c), 0)
  return result.toString()
}

/**
 * Decode 64bit unsigned integer string into tag string with hash.
 * TODO: Use BigInt if tags are >2^53 at some point.
 */
export function idToTag(idString: string) {
  let id = Number(idString)

  let tag = ''
  while (id != 0) {
    const i = id % 14
    tag = '0289PYLQGRJCUV'[i] + tag
    id = Math.floor(id / 14)
  }

  return '#' + tag
}

/*
  in SQL:
    date_add(from_days(ceil(to_days(date_sub(date_sub(timestamp, interval 8 hour), interval 1 day)) / 14) * 14 + 2), interval 8 hour)
  in clickhouse SQL:
    toStartOfInterval(now(), toIntervalDay(14), toDateTime('2020-07-13 08:00:00')) + toIntervalDay(14)
*/
/**
 * Round timestamp up to next legacy trophy season interval.
 * Seasons used to be 2 weeks, this is what the database uses.
 * @param timestamp
 */
export function getSeasonEnd(timestamp: Date) {
  const trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'))
  const diff = timestamp.getTime() - trophySeasonEnd.getTime()
  const seasonsSince = Math.ceil(diff/1000/60/60/24/7/2)
  trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince*7*2)
  return trophySeasonEnd
}

/**
 * Round timestamp up to next new trophy season interval.
 * Seasons are now 4 weeks.
 * @param timestamp
 */
export function getSeasonEndNew(timestamp: Date) {
  const trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'))
  const diff = timestamp.getTime() - trophySeasonEnd.getTime()
  const seasonsSince = Math.ceil(diff/1000/60/60/24/7/4)
  trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince*7*4)
  return trophySeasonEnd
}

/*
 * Round timestamp down to start of day.
 * @param timestamp
 */
export function getCompetitionMapDayStart(timestamp: Date) {
  const dayStart = new Date(Date.parse('2020-07-13T09:30:00Z'))
  const diff = timestamp.getTime() - dayStart.getTime()
  const daysSince = Math.ceil(diff/1000/60/60/24)
  dayStart.setUTCDate(dayStart.getUTCDate() + daysSince - 1)
  return dayStart
}

export function getCompetitionWinnerMode(timestamp: Date) {
  const order = ['duoShowdown', 'siege', 'hotZone', 'soloShowdown', 'brawlBall', 'bounty', 'heist', 'gemGrab']
  const dayStart = new Date(Date.parse('2021-04-24T09:30:00Z'))
  const diff = timestamp.getTime() - dayStart.getTime()
  const daysSince = Math.floor(diff/1000/60/60/24)
  return order[daysSince % order.length]
}

/**
 * Get the end date of the current and the last database-season
 */
export function getMonthSeasonEnd() {
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  return getSeasonEnd(twoWeeksAgo)
}

/**
 * Get the end date of the current database-season
 */
export function getTodaySeasonEnd() {
  return getSeasonEnd(new Date())
}

export function parseClickhouse(timestamp: string) {
  return parseISO(timestamp + 'Z')
}

export function formatClickhouse(timestamp: Date) {
  return timestamp.toISOString()
    .slice(0, 19) // remove fractions and time zone
    .replace('T', ' ')
}

export function formatClickhouseDate(timestamp: Date) {
  return timestamp.toISOString()
    .slice(0, 10) // remove fractions, day and time zone
}

/** Parse API time format */
const parseTime = (time: string) => new Date(Date.parse(time))
export const parseApiTime = (time: string) => {
  return parseTime(`${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13)}`)
}

export function encodeQuery(data: { [key: string]: number|string }) {
   const ret = [] as string[]
   for (let d in data) {
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
   }
   return ret.join('&')
}

/*
 * @returns true if a mode is a weekend mode
 */
export function isSpecialEvent(mode: string) {
  return ['roboRumble', 'bigGame', 'superCity'].includes(mode)
}

export const getDotProp = (o: any, k: string) => k.split('.').reduce((a, b) => a[b], o)

// measured on 2023-11-07
// select quantile(0.25)(player_trophies/player_brawlers_length), quantile(0.375)(player_trophies/player_brawlers_length), quantile(0.5)(player_trophies/player_brawlers_length), quantile(0.90)(player_trophies/player_brawlers_length), quantile(0.95)(player_trophies/player_brawlers_length), quantile(0.99)(player_trophies/player_brawlers_length) from battle where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day and battle_event_powerplay=0
export const ratingPercentiles = {
  // key: percentile, trophy boundary
  '?': [0, 400],
  'D': [0.25, 450],
  'C': [0.375, 500],
  'B': [0.5, 750],
  'A': [0.9, 850],
  'S': [0.95, 1050],
  'S+': [0.99, Infinity],
}

export const tagPattern = new RegExp('^#?[0289PYLQGRJCUV]{3,}$')

export function calculateAccountRating(player: Player, brawlersCount: number) {
  const brawlersUnlocked = Object.keys(player.brawlers).length
  const brawlerTrophies = [...Object.values(player.brawlers)]
    .map(({ trophies }) => trophies)
    .sort((a, b) => a - b)
  const medianBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
  const trophiesGoal = medianBrawlerTrophies * brawlersCount
  let rating = '?'
  for (const key in ratingPercentiles) {
    if (medianBrawlerTrophies <= ratingPercentiles[key as keyof typeof ratingPercentiles][1]) {
      rating = key
      break
    }
  }

  return {
    rating,
    medianBrawlerTrophies,
    brawlersUnlocked,
    trophiesGoal,
  }
}

export const calculateMoe = (sample: number, total: number) => {
  // margin of error
  // moe = z * standard error
  // for binomial (normal approximation):
  // moe = z * Math.sqrt(p*(1-p)/n)
  // worst case, p=50%
  // best case, n = sample / brawlers
  // (assumes we are slicing Brawlers)
  return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (sample / total))
}

export const rateMoe = (moe: number) => {
  if (moe <= 0.005) {
    return 'perfect'
  }
  if (moe <= 0.01) {
    return 'good'
  }
  if (moe <= 0.025) {
    'mediocre'
  }
  return 'poor'
}

export const calculateGini = (useRates: number[]) => {
  // calculate Gini coefficient
  let absoluteDifference = 0
  let arithmeticMean = 0
  for (const u1 of useRates) {
    arithmeticMean += u1 / useRates.length
    for (const u2 of useRates) {
      absoluteDifference += Math.abs(u1 - u2)
    }
  }
  return absoluteDifference / (2 * Math.pow(useRates.length, 2) * arithmeticMean)
}

export const rateGini = (gini: number) => {
  if (gini > 0.4) {
    return 'very one-sided'
  }
  if (gini > 0.3) {
    return 'one-sided'
  }
  return 'balanced'
}

export const calculatePlayerProgression = (player: Player) => {
  return calculateProgression(Object.values(player.brawlers).map(brawler => ({
    power: brawler.power,
    starPowersCount: brawler.starPowers.length,
    gadgetsCount: brawler.gadgets.length,
    gearNames: brawler.gears.map(gear => gear.name),
  })))
}

export const calculateProgression = (brawlers: {
  power: number,
  starPowersCount: number,
  gadgetsCount: number,
  gearNames: string[],
}[]) => {
  const rareGears = ['SPEED', 'HEALTH', 'DAMAGE', 'VISION', 'SHIELD', 'GADGET CHARGE'];
  const epicGears = ['RELOAD SPEED', 'SUPER CHARGE', 'PET POWER'];
  const brawlerUpgradeCost = [0, 20, 55, 130, 270, 560, 1040, 1840, 3090, 4965, 7765];

  const sum = (a: number, b: number) => a + b;
  const brawler = brawlers.map(brawler =>
    brawlerUpgradeCost[brawler.power - 1]
  ).reduce(sum, 0)
  const starPower = brawlers.map(brawler =>
    brawler.starPowersCount * 2000
  ).reduce(sum, 0)
  const gadget = brawlers.map(brawler =>
    brawler.gadgetsCount * 1000
  ).reduce(sum, 0)
  const gear = brawlers.flatMap(brawler =>
    brawler.gearNames.map(id => {
      if (rareGears.includes(id)) {
        return 1000;
      } else if (epicGears.includes(id)) {
        return 1500;
      } else {
        return 2000;
      }
    })
  ).reduce(sum, 0);

  const total = brawler + starPower + gadget + gear;

  return {
    coins: {
      brawler,
      starPower,
      gadget,
      gear,
      total
    },
    counts: {
      brawler: brawlers.length,
      starPower: brawlers.map(brawler => brawler.starPowersCount).reduce(sum, 0),
      gadget: brawlers.map(brawler => brawler.gadgetsCount).reduce(sum, 0),
      gear: brawlers.map(brawler => brawler.gearNames.length).reduce(sum, 0),
    },
  };
}

export const calculateSeasonEndReward = (player: Player) => {
  return Object.values(player.brawlers)
    .map(brawler => Math.min(Math.max(brawler.trophies, 500), 1500))
    .sort((a, b) => b - a)
    .slice(0, Math.min(Object.keys(player.brawlers).length, 10))
    .reduce((acc, trophies) => {
      if (trophies < 500) {
        return acc;
      }

      const trophiesToLose = (trophies % 25) + (trophies >= 525 ? 1 : 0);
      const blingReward = Math.floor((trophies - 450) / 25) * 2;

      return {
        reward: acc.reward + blingReward,
        trophies: acc.trophies - trophiesToLose,
      };
    }, { reward: 0, trophies: 0 });
};

export const formatLeagueRanks = (rank: number) => {
  // min rank: 1, max rank: 19
  const leagues = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic', 'Legendary', 'Masters'] as const
  const leagueSubs = ['I', 'II', 'III'] as const
  const league = leagues[Math.floor((rank - 1) / 3)]
  const leagueSub = leagueSubs[(rank - 1) % 3]

  return {
    league,
    leagueSub,
    formatted: `${league} ${rank < 19 ? leagueSub : ''}`
  }
}
