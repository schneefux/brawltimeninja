import { parseISO } from "date-fns"
import { formatMode } from "~/lib/util"

const cubes = ['player', 'brawler', 'map', 'synergy', 'starpower', 'gadget']

interface Clicker {
  defaultSlices(cube: string): Record<string, string[]>
  cubes: typeof cubes[number][]
  queryMetadata(cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }>
  query<T=any>(
    name: string,
    cube: typeof cubes[number],
    dimensions: string[],
    measures: string[],
    slices: Record<string, string[]>,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
    }): Promise<{ data: T[], totals: T }>
  queryAllModes(): Promise<string[]>
  describeSlices(slices: Record<string, string[]>, timestamp?: string): string
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

export default (context, inject) => {
  inject('clicker', <Clicker>{
    defaultSlices(cube) {
      switch (cube) {
        case 'map':
          return {
            trophy_season_end: ['balance'],
            brawler_trophyrange: ['0', '10'],
            battle_event_powerplay: ['false'],
          }
        case 'battle':
          return {
            trophy_season_end: ['month'],
          }
        case 'brawler':
          return {
          }
        default:
          return {
            trophy_season_end: ['balance'],
            brawler_trophyrange: ['0', '10'],
          }
      }
    },
    cubes,
    queryMetadata(cube) {
      return context.$axios.$get(context.env.clickerUrl + '/clicker/cube/' + cube + '/metadata')
    },
    query(name, cube, dimensions, measures, slices, options = {}) {
      const query = new URLSearchParams({
        include: measures.join(','),
      })
      if (name != undefined) {
        query.append('name', name)
      }
      if (options.sort != undefined) {
        query.append('sort', Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(','))
      }
      if (options.limit != undefined) {
        query.append('limit', options.limit.toString())
      }
      if (options.cache != undefined) {
        query.append('cache', options.cache.toString())
      }
      Object.entries(slices).forEach(([name, args]) => query.append('slice[' + name + ']', args.join(',')))
      const url = context.env.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + query.toString()
      console.log(`querying clicker: cube=${cube}, dimensions=${JSON.stringify(dimensions)}, measures=${JSON.stringify(measures)}, slices=${JSON.stringify(slices)} name=${name} (${url})`)
      return context.$axios.$get(url)
    },
    async queryAllModes() {
      const modes = await this.query<{ battle_event_mode: string }>('all.modes', 'map',
        ['battle_event_mode'],
        ['battle_event_mode'],
        { trophy_season_end: ['balance'] },
        { sort: { picks: 'desc' }, cache: 60*60*24 })
      return modes.data.map(row => row.battle_event_mode)
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
          mapName += ' (Power Play)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power Play')
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
  })
}
