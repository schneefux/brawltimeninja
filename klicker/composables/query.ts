import { computed, Ref, watch } from 'vue'
import { useLazyAsyncData, useNuxtApp } from '#imports' // uses vue-ssr's onServerPrefetch
import { useKlicker } from './klicker'
import { CubeQuery, CubeResponse, CubeComparingQuery, CubeComparingResponse, CubeQueryFilter, CubeComparingQueryFilter } from '../types'

function hash(query: CubeQuery|CubeComparingQuery): string {
  const hashCode = (s: string) => {
    if (s.length === 0) {
      return 0
    }

    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const chr = s.charCodeAt(i)
      hash = ((hash << 5) - hash) + chr
      hash |= 0
    }
    return hash
  }

  return hashCode(JSON.stringify(query)).toString()
}

/**
 * Run a query
 */
export const useCubeQuery = (query: Ref<CubeComparingQuery|CubeQuery>, filter?: Ref<CubeComparingQueryFilter|CubeQueryFilter|undefined>) => {
  const { $klicker } = useKlicker()
  const { $sentry } = useNuxtApp() as any

  async function fetch(): Promise<undefined|CubeResponse|CubeComparingResponse> {
    try {
      if (!query.value.comparing) {
        return await $klicker.query(query.value, <CubeQueryFilter>filter?.value)
      } else {
        return await $klicker.comparingQuery(<CubeComparingQuery>query.value, <CubeComparingQueryFilter>filter?.value)
      }
    } catch (err) {
      console.error(err)
      if ($sentry != undefined) {
        (<any> $sentry).captureException(err)
      }
      throw err
    }
  }

  const asyncResponse = useLazyAsyncData(`c-query-${hash(query.value)}`, () => fetch())
  const error = computed(() => asyncResponse.error.value)
  const response = computed(() => asyncResponse.data.value)
  const loading = computed(() => asyncResponse.pending.value)

  const update = () => asyncResponse.refresh()
  watch(query, update)

  return {
    $klicker,
    error,
    response,
    loading,
    update,
  }
}
