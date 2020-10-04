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
      console.log('querying clicker: ' + url)
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
  })
}
