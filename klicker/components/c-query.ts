import { VNode, defineComponent, PropType, ref, h, watch } from 'vue-demi'
import { useAsync, useContext } from '@nuxtjs/composition-api' // uses vue-ssr's onServerPrefetch
import { useKlicker } from '../composables/klicker'
import { CubeQuery, CubeResponse, CubeComparingQuery, CubeComparingResponse, CubeQueryFilter, CubeComparingQueryFilter } from '../types'

// TODO accept `query` as prop.
// If query.query corresponds to a query that should be fetched, re-use it.
// Or just rely on browser caching instead?

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

export default defineComponent({
  name: 'c-query',
  props: {
    query: {
      type: Object as PropType<CubeComparingQuery|CubeQuery>,
      required: true
    },
    filter: {
      type: Function as PropType<CubeComparingQueryFilter|CubeQueryFilter>,
      required: false
    },
  },
  setup(props, { slots }) {
    const { $klicker } = useKlicker()
    const { $sentry } = useContext()

    const loading = ref(false)
    const error = ref<string|undefined>()

    async function fetch(): Promise<undefined|CubeResponse|CubeComparingResponse> {
      error.value = undefined
      loading.value = true
      try {
        if (!props.query.comparing) {
          return await $klicker.query(props.query, <CubeQueryFilter>props.filter)
        } else {
          return await $klicker.comparingQuery(<CubeComparingQuery>props.query, <CubeComparingQueryFilter>props.filter)
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

    const response = useAsync(() => fetch(), `c-query-${hash(props.query)}`)
    watch(() => props.query, async () => response.value = await fetch())

    return () => {
      let nodes: VNode[] | undefined

      if (error.value) {
        if ('error' in slots) {
          nodes = slots.error!({
            error: error.value,
          })
        }
      } else {
        const loaded = response.value != undefined
        if (loaded) {
          const empty = response.value!.data.length == 0
          if (empty && 'empty' in slots) {
            nodes = slots.empty!({})
          } else {
            // show default if empty and no 'empty' slot
            if ('default' in slots) {
              nodes = slots.default!({
                response: response.value,
                loading: loading.value,
              })
            }
          }
        } else {
          if ('placeholder' in slots) {
            nodes = slots.placeholder!({})
          }
        }
      }

      if (nodes == undefined) {
        return undefined
      }
      if (nodes.length > 1) {
        return h('div', nodes)
      }
      return nodes[0]
    }
  },
})
