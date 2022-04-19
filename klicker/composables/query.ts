import { Ref, ref, watch } from 'vue-demi'
import { useAsync, useContext } from '@nuxtjs/composition-api' // uses vue-ssr's onServerPrefetch
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

export const useCubeQuery = (query: Ref<CubeComparingQuery|CubeQuery>, filter?: Ref<CubeComparingQueryFilter|CubeQueryFilter|undefined>) => {
  const { $klicker } = useKlicker()
  const { $sentry } = useContext() as any

  const loading = ref(false)
  const error = ref<string|undefined>()

  async function fetch(): Promise<undefined|CubeResponse|CubeComparingResponse> {
    error.value = undefined
    loading.value = true
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
      error.value = err as string
      return undefined
    } finally {
      loading.value = false
    }
  }

  const response = useAsync(() => fetch(), `c-query-${hash(query.value)}`)
  const update = async () => response.value = await fetch()
  watch(query, update)

  return {
    $klicker,
    error,
    response,
    loading,
    update,
  }
}
