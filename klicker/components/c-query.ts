import { VNode, defineComponent, PropType, h, toRefs } from 'vue-demi'
import { CubeQuery, CubeComparingQuery, CubeQueryFilter, CubeComparingQueryFilter } from '../types'
import { useCubeQuery } from '../composables/query'
import BShimmer from './ui/b-shimmer.vue'

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
    disappearWhenEmpty: {
      type: Boolean,
      default: false
    },
  },
  setup(props, { slots }) {
    const { query, filter } = toRefs(props)
    const { response, error, loading } = useCubeQuery(query, filter)

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
          if (empty) {
            if ('empty' in slots) {
              nodes = slots.empty!({})
            }
          } else {
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
          } else {
            nodes = [h(BShimmer as any, { props: { loading: true } })]
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
