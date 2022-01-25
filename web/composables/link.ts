import { computed, useRoute, useRouter, Ref } from '@nuxtjs/composition-api'
import { Config, CubeComparingQuery, CubeQuery } from 'klicker/types'
import { useKlicker } from 'klicker/composables/klicker'

export const useSyncQueryAndRoute = (config: Config, defaultCubeId: string) => {
  const { $klicker } = useKlicker()
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return $klicker.convertLocationToQuery(config, defaultCubeId, route.value)
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace($klicker.convertQueryToLocation(q))
    }
  })
}

export const useSyncSlicesAndRoute = (defaults: Ref<CubeQuery|CubeComparingQuery>) => {
  const { $klicker } = useKlicker()
  const route = useRoute()
  const router = useRouter()

  return computed({
    get() {
      return {
        ...defaults.value,
        slices: $klicker.convertLocationToSlices(route.value, defaults.value.slices)
      }
    },
    set(q: CubeQuery|CubeComparingQuery) {
      router.replace($klicker.convertSlicesToLocation(q.slices))
    }
  })
}
