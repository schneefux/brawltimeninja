import { defineComponent, PropType, ref, toRefs, h, useContext, useAsync, watch } from '@nuxtjs/composition-api'
import { VNode } from 'vue'
import { CubeQuery, CubeResponse, CubeComparingQuery, CubeComparingResponse } from '~/klicker'

// TODO accept `query` as prop.
// If query.query corresponds to a query that should be fetched, re-use it.
// Or just rely on browser caching instead?

export default defineComponent({
  name: 'c-query',
  props: {
    query: {
      type: Object as PropType<CubeComparingQuery|CubeQuery>,
      required: true
    },
  },
  setup(props, { slots }) {
    const { $sentry, $klicker } = useContext()
    const loading = ref(false)
    const error = ref(false)

    const { query } = toRefs(props)

    async function fetch(): Promise<undefined|CubeResponse|CubeComparingResponse> {
      error.value = false
      loading.value = true
      try {
        if (!('test' in query.value)) {
          return await $klicker.query(query.value)
        } else {
          return await $klicker.comparingQuery(query.value)
        }
      } catch (err) {
        console.error(err)
        $sentry.captureException(err)
        error.value = true
        return undefined
      } finally {
        loading.value = false
      }
    }

    const response = useAsync(() => fetch(), $klicker.hash(query.value))
    watch(query, async () => response.value = await fetch())

    return () => {
      let nodes: VNode[] | undefined

      if (error.value) {
        if ('error' in slots) {
          nodes = slots.error!({})
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
        return h()
      }
      if (nodes.length > 1) {
        return h('div', nodes)
      }
      return nodes[0]
    }
  },
})
