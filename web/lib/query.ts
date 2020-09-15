import { NuxtAxiosInstance } from "@nuxtjs/axios";

export const cubes = ['player', 'brawler', 'map', 'starpower', 'gadget']

export function queryMetadata(
    context: { $axios: NuxtAxiosInstance, env: Record<string, string|undefined> }, // TODO move to plugin
    cube: typeof cubes[number]): Promise<{ dimensions: string[], measures: string[], slices: Record<string, number> }> {
  return context.$axios.$get(context.env.clickerUrl + '/clicker/cube/' + cube + '/metadata')
}

export default function query<M extends string, D extends string>(
    context: { $axios: NuxtAxiosInstance, env: Record<string, string|undefined> }, // TODO move to plugin
    cube: typeof cubes[number],
    dimensions: D[],
    measures: M[],
    slices: Record<string, string[]>,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
    } = {}): Promise<{ data: Record<M|D, string|number>[], totals: Record<M|D, string|number> }> {
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
}
