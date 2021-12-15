import { computed, useRoute, useRouter, Ref } from '@nuxtjs/composition-api'
import { Config, CubeComparingQuery, CubeQuery, SliceValue } from '..'
import { Location, Route } from 'vue-router'

// workaround for https://github.com/vuejs/vue-router/issues/2725
// FIXME remove when upgrading to vue-router 3
function safeEncode(arr: (string|number|boolean|undefined)[]) {
  return arr
    .filter(s => s != undefined)
    .map(s => typeof s == 'string' ? s.replace(/%/g, '%23') : s!.toString())
}
function safeDecode(arr: (string|null|undefined)[]) {
  return arr?.map(s => s?.replace(/%23/g, '%'))
}

function parseQueryParams(query: Record<string, string | (string | null)[] | null | undefined>, prefix: string): object {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => key.startsWith(prefix + '[') && key.endsWith(']'))
      .map(([key, value]) => [key.substring((prefix + '[').length, key.length - ']'.length), safeDecode(Array.isArray(value) ? value : [value])])
  )
}

function generateQueryParams(o: Record<string, (string|number|undefined)[]>, prefix: string): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(o)
      .filter(([key, value]) => value != undefined)
      .map(([key, value]) => [prefix + '[' + key + ']', safeEncode(value)])
  )
}

export function convertQueryToLocation(query: CubeQuery|CubeComparingQuery) {
  if ('comparing' in query) {
    const q = query as CubeComparingQuery
    // slices are swapped for compatibility with old dashboard links
    const slices = q.slices ? generateQueryParams(q.slices, 'compareFilter') : {}
    const testSlices = q.slices ? generateQueryParams(q.reference.slices, 'filter') : {}
    return <Location>{
      query: {
        ...slices,
        ...testSlices,
        compare: 'true',
        cube: q.cubeId,
        dimension: q.dimensionsIds,
        metric: q.measurementsIds,
      },
    }
  } else {
    const q = query as CubeQuery
    const slices = q.slices ? generateQueryParams(q.slices, 'filter') : {}
    return <Location>{
      query: {
        ...slices,
        compare: undefined,
        cube: q.cubeId,
        dimension: q.dimensionsIds,
        metric: q.measurementsIds,
        sort: q.sortId,
      },
    }
  }
}

function convertToQuery(config: Config, defaultCubeId: string, route: Route): CubeQuery|CubeComparingQuery {
  const query = route.query || {}

  const cubeId = query.cube as string || defaultCubeId
  let slices = parseQueryParams(query, 'filter') as SliceValue
  slices = Object.assign({}, config[cubeId].defaultSliceValues, slices)

  const comparing = query.compare != undefined
  let comparingSlices = parseQueryParams(query, 'compareFilter') as SliceValue|undefined
  comparingSlices = comparing ? Object.assign({}, config[cubeId].defaultSliceValues, comparingSlices) : undefined

  let dimensionsIds = query.dimension as string[] || config[cubeId].defaultDimensionsIds
  if (typeof dimensionsIds == 'string') {
    dimensionsIds = [dimensionsIds]
  }

  let measurementsIds = query.metric as string[] || config[cubeId].defaultMeasurementIds
  if (typeof measurementsIds == 'string') {
    measurementsIds = [measurementsIds]
  }

  const sortId = query.sort as string || measurementsIds[0]
  const limit = typeof query.limit == 'string' ? parseInt(query.limit) : undefined

  if (comparing) {
    return {
      comparing: true,
      cubeId,
      slices: comparingSlices!,
      sortId,
      limit,
      dimensionsIds,
      measurementsIds,
      reference: {
        cubeId,
        sortId,
        dimensionsIds,
        slices: slices,
        measurementsIds,
      },
    }
  } else {
    return {
      cubeId,
      sortId,
      slices,
      limit,
      dimensionsIds,
      measurementsIds,
    }
  }
}

function convertSlicesToLocation(slices: SliceValue): Location {
  return generateQueryParams(slices, 'filter')
}

function convertToSlices(route: Route, defaults: SliceValue): SliceValue {
  const slices = parseQueryParams(route.query, 'filter') as SliceValue
  return Object.assign({}, defaults, slices)
}


export const useSyncQueryAndRoute = (config: Config, defaultCubeId: string) => {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return convertToQuery(config, defaultCubeId, route.value)
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace(convertQueryToLocation(q))
    }
  })
}

export const useSyncSlicesAndRoute = (defaults: Ref<CubeQuery|CubeComparingQuery>) => {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return {
        ...defaults.value,
        slices: convertToSlices(route.value, defaults.value.slices)
      }
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace(convertSlicesToLocation(q.slices))
    }
  })
}
