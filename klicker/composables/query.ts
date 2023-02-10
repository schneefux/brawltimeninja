import { computed, Ref } from 'vue'
import { useKlickerConfig } from './klicker'
import { CubeQuery, CubeComparingQuery, CubeQueryFilter, CubeComparingQueryFilter } from '../types'
import { hashCode } from '../util'

function hash(query: CubeQuery|CubeComparingQuery): string {
  return hashCode(JSON.stringify(query)).toString()
}

/**
 * Run a query
 */
export const useCubeQuery = (query: Ref<CubeComparingQuery|CubeQuery>, filter?: Ref<CubeComparingQueryFilter|CubeQueryFilter|undefined>) => {
  const { $klicker, useQuery } = useKlickerConfig()

  async function fetch() {
    if (!query.value.comparing) {
      return await $klicker.query(query.value, <CubeQueryFilter>filter?.value)
    } else {
      return await $klicker.comparingQuery(<CubeComparingQuery>query.value, <CubeComparingQueryFilter>filter?.value)
    }
  }

  const key = computed(() => `klicker-query-${hash(query.value)}`)
  const asyncResponse = useQuery(key, fetch)
  const error = computed(() => asyncResponse.error.value)
  const response = computed(() => asyncResponse.data.value)
  const loading = computed(() => asyncResponse.loading.value)

  return {
    $klicker,
    error,
    response,
    loading,
    update: () => asyncResponse.refresh(),
  }
}
