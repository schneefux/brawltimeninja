import { parseISO } from "date-fns"
import { formatMode } from "~/lib/util"
import { Plugin } from "@nuxt/types"

// deprecated plugin

export interface PicksWins {
  picks: number
  wins: number
}

export interface Slices extends Record<string, string[]|undefined> {}

interface Clicker {
  defaultSlicesRaw(cubeId: string): Record<string, string[]>
  query<T=any>(
    name: string,
    cube: string,
    dimensions: string[],
    measures: string[],
    slices: Slices,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
      totals?: boolean,
    }): Promise<{ data: T[], totals?: T, statistics: Record<string, number> }>
  describeSlices(slices: Slices, timestamp?: string): string
  calculateBayesSynergies(tag: string, brawler?: string, limit?: number): Promise<{
    sampleSize: number,
    timestamp: string,
    // H
    totals: PicksWins,
    // H(brawler)
    data: Map<string, PicksWins>,
    // H(ally_brawler,brawler)
    pairData: Map<string, Map<string, PicksWins>>,
  }>
}

declare module 'vue/types/vue' {
  interface Vue {
    $clicker: Clicker
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $clicker: Clicker
  }
  interface Context {
    $clicker: Clicker
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $clicker: Clicker
  }
}

const plugin: Plugin = (context, inject) => {
  inject('clicker', <Clicker>{
    defaultSlicesRaw(cube) {
      switch (cube) {
        case 'map':
          return {
            trophy_season_end: ['month'],
            battle_event_powerplay: ['false'],
          }
        case 'battle':
          return {
            trophy_season_end: ['month'],
          }
        case 'brawler':
          return {
          }
        case 'synergy':
          return {
            trophy_season_end: ['month'],
            ally_brawler_name: ['SHELLY'],
          }
        default:
          return {
            trophy_season_end: ['month'],
          }
      }
    },
    async query(name, cube, dimensions, measures, slices, options = {}) {
      // SSR does not support UrlSearchParams
      const query = {
        include: measures.join(','),
      }
      const headers = {} as Record<string, string>
      if (options.sort != undefined) {
        query['sort'] = Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(',')
      }
      if (options.limit != undefined) {
        query['limit'] = options.limit.toString()
      }
      if (options.totals == true) {
        query['totals'] = options.totals.toString()
      }
      if (name != undefined) {
        headers['x-brawltime-tag'] = name
      }
      if (options.cache != undefined) {
        headers['x-brawltime-cache'] = options.cache.toString()
      }
      Object.entries(slices)
        .filter(([name, args]) => args != undefined)
        .forEach(([name, args]) => query['slice[' + name + ']'] = args!.join(','))
      const queryString = Object.entries(query)
        .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : 0)
        .map(([k, v]) => k + '=' + encodeURIComponent(v))
        .join('&')
      const url = context.$config.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + queryString
      console.log(`querying clicker: cube=${cube}, dimensions=${JSON.stringify(dimensions)}, measures=${JSON.stringify(measures)}, slices=${JSON.stringify(slices)} name=${name} (${url})`)
      return context.$http.$get(url, { headers })
    },
    describeSlices(slices: Record<string, string[]>, timestamp?: string) {
      let description: string[] = []

      const powerplay = 'battle_event_powerplay' in slices && slices.battle_event_powerplay[0] == 'true'

      if ('battle_event_mode' in slices) {
        let mapName = formatMode(slices.battle_event_mode[0])
        if ('battle_event_map' in slices) {
          mapName += ' - ' + slices.battle_event_map[0]
        }
        if (powerplay) {
          mapName += ' (Power League)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power League')
        }
      }

      if ('brawler_trophyrange' in slices) {
        let trophyName = ''
        if (slices.brawler_trophyrange[0] == '0' && slices.brawler_trophyrange[1] == '10') {
          trophyName = 'all '
        } else {
          const lower = slices.brawler_trophyrange[0] + '00'
          const upper = slices.brawler_trophyrange[1] == '10' ? '+' : ('-' + slices.brawler_trophyrange[1] + '00')
          trophyName = lower + upper + ' '
        }
        trophyName += powerplay ? 'Points' : 'Trophies'
        description.push(trophyName)
      }

      const seasonDescription = {
        balance: 'update',
        month: 'month',
        season: 'season',
      }
      if ('trophy_season_end' in slices && slices.trophy_season_end[0] in seasonDescription) {
        description.push('current ' + seasonDescription[slices.trophy_season_end[0]])
      }

      if (timestamp != undefined) {
        description.push('created ' + parseISO(timestamp).toLocaleDateString())
      }

      return description.join(', ')
    },
    async calculateBayesSynergies(tag: string, brawler?: string, limit?: number) {
      const slices = {
        trophy_season_end: ['month'],
      }

      // H(ally_brawler,brawler)
      const pairData = await this.query(tag, 'synergy',
        ['brawler_name', 'ally_brawler_name'],
        ['wins', 'picks'],
        {
          ...slices,
          ...(brawler == undefined ? {} : { brawler_name: [brawler.toUpperCase()] }),
        },
        {
          cache: 60*60,
          sort: { wins: 'desc' },
          limit,
        })
      // H(brawler) and H
      const data = await this.query(tag, 'map',
        ['brawler_name'],
        ['wins', 'picks', 'timestamp'],
        slices,
        {
          cache: 60*60,
          totals: true,
        })

      const totalSampleSize = data.totals!.picks
      const totalTimestamp = data.totals!.timestamp

      // H(ally_brawler,brawler)
      const pairMap = new Map<string, Map<string, PicksWins>>()
      pairData.data.forEach((row) => {
        if (!pairMap.has(row.brawler_name)) {
          pairMap.set(row.brawler_name, new Map<string, PicksWins>())
        }
        pairMap.get(row.brawler_name)!.set(row.ally_brawler_name, {
          picks: row.picks,
          wins: row.wins,
        })
      })
      // H(brawler)
      const dataMap = new Map<string, PicksWins>()
      data.data.forEach((row) => dataMap.set(row.brawler_name, row))
      // H
      const totals: PicksWins = {
        picks: data.totals!.picks,
        wins: data.totals!.wins,
      }

      return {
        totals,
        data: dataMap,
        pairData: pairMap,
        sampleSize: totalSampleSize,
        timestamp: totalTimestamp,
      }
    },
  })
}

export default plugin
