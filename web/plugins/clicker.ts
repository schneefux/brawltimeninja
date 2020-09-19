const cubes = ['player', 'brawler', 'map', 'starpower', 'gadget']

interface Clicker {
  cubes: typeof cubes[number][]
  queryMetadata(cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }>
  query<M extends string, D extends string>(
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
    cubes,
    queryMetadata(cube) {
      return context.$axios.$get(context.env.clickerUrl + '/clicker/cube/' + cube + '/metadata')
    },
    query(cube, dimensions, measures, slices, options = {}) {
      const query = new URLSearchParams({
        include: measures.join(','),
      })
      if (options.sort) {
        query.append('sort', Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(','))
      }
      if (options.limit) {
        query.append('limit', options.limit.toString())
      }
      if (options.cache) {
        query.append('cache', options.cache.toString())
      }
      Object.entries(slices).forEach(([name, args]) => query.append('slice[' + name + ']', args.join(',')))
      const url = context.env.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + query.toString()
      console.log('querying clicker: ' + url)
      return context.$axios.$get(url)
    },
  })
}
