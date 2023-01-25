import { computed, Ref } from 'vue'
import { Config, CubeComparingQuery, CubeQuery, RouteQuery } from '@schneefux/klicker/types'
import { useKlicker } from '@schneefux/klicker/composables/klicker'
import { RouteLocation, useRoute, useRouter } from 'vue-router'

export function mapRouteQuery(route: RouteLocation): RouteQuery {
  const query: RouteQuery['query'] = {}
  for (const [key, value] of Object.entries(route.query)) {
    const values = Array.isArray(value) ? value : [value]
    const nonNullValues = values.filter((v): v is string => v != null)
    if (nonNullValues.length > 0) {
      query[key] = nonNullValues
    }
  }
  return { query }
}

export const useSyncQueryAndRoute = (config: Config, defaultCubeId: string) => {
  const $klicker = useKlicker()
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return $klicker.convertLocationToQuery(config, defaultCubeId, mapRouteQuery(route))
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace($klicker.convertQueryToLocation(q))
    }
  })
}

export const useSyncSlicesAndRoute = (defaults: Ref<CubeQuery|CubeComparingQuery>) => {
  const $klicker = useKlicker()
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return {
        ...defaults.value,
        slices: $klicker.convertLocationToSlices(mapRouteQuery(route), defaults.value.slices)
      }
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace($klicker.convertSlicesToLocation(q.slices, defaults.value.slices))
    }
  })
}
