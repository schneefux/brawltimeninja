import { VNode } from 'vue'
import { defineComponent, PropType, h, toRefs } from 'vue'
import { CubeQuery, CubeComparingQuery, CubeQueryFilter, CubeComparingQueryFilter } from '../types'
import { useCubeQuery } from '../composables/query'
import BShimmer from './ui/b-shimmer.vue'
import BButton from './ui/b-button.vue'
import { useKlicker } from '../composables'

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
    const { query, filter } = toRefs(props)
    const { translate } = useKlicker()
    const { response, error, loading, update } = useCubeQuery(query, filter)

    return () => {
      let nodes: VNode[] | undefined

      if (error.value) {
        if ('error' in slots) {
          nodes = slots.error!({
            error: error.value,
          })
        } else {
          nodes = [h('div', {
            class: 'h-full w-full flex flex-col justify-center items-center space-y-2 space-x-2',
          }, [
            h('span', {}, [translate('query.error')]),
            h(BButton as any, {
              props: {
                dark: true,
                xs: true,
              },
              on: {
                click: (event) => {
                  event.stopPropagation()
                  update()
                },
              },
            }, [translate('action.retry')]),
          ])]
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
            nodes = [h(BShimmer as any, {
              props: { loading: true },
              class: 'h-full',
            })]
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
