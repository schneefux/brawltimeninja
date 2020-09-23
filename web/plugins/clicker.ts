const cubes = ['player', 'brawler', 'map', 'synergy', 'starpower', 'gadget']

const defaultSlices = {
  trophy_season_end: ['balance'],
  brawler_trophyrange: ['0', '10'],
}

const defaultMapSlices = {
  ...defaultSlices,
  battle_event_powerplay: ['false'],
}

interface Clicker {
  defaultSlices(cube: string): typeof defaultSlices | typeof defaultMapSlices
  cubes: typeof cubes[number][]
  queryMetadata(cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }>
  query<M extends string, D extends string>(
    name: string,
    cube: typeof cubes[number],
    dimensions: D[],
    measures: M[],
    slices: Record<string, string[]>,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
    }): Promise<{ data: Record<M|D, string|number>[], totals: Record<M|D, string|number> }>
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
      return cube == 'map' ? defaultMapSlices : defaultSlices
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
  })
}
