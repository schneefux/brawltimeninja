import Vue, { PropType, VNode } from 'vue'
import { CubeQuery, CubeResponse, CubeComparingQuery, CubeResponseTest } from '~/klicker'

// TODO accept `query` as prop.
// If query.query corresponds to a query that should be fetched, re-use it.
// Or just rely on browser caching instead?

// TODO rewrite in composition API
export default Vue.extend({
  name: 'c-query',
  props: {
    query: {
      type: Object as PropType<CubeComparingQuery|CubeQuery>,
      required: true
    },
  },
  data() {
    return {
      loading: false,
      response: undefined as undefined|CubeResponse|CubeResponseTest,
      error: false,
    }
  },
  watch: {
    query: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.error = false
    this.loading = true
    try {
      if (!('comparingMeasurementId' in this.query)) {
        this.response = await this.$klicker.query(this.query)
      } else {
        this.response = await this.$klicker.comparingQuery(this.query)
      }
    } catch (error) {
      console.error(error)
      this.$sentry.captureException(error)
      this.response = undefined
      this.error = true
    }
    this.loading = false
  },
  render(h): VNode {
    let nodes: VNode[] | undefined

    if (this.error) {
      if ('error' in this.$scopedSlots) {
        nodes = this.$scopedSlots.error!({})
      }
    } else {
      const loaded = this.response != undefined
      if (loaded) {
        const empty = this.response!.data.length == 0
        if (empty && 'empty' in this.$scopedSlots) {
          nodes = this.$scopedSlots.empty!({})
        } else {
          // show default if empty and no 'empty' slot
          if ('default' in this.$scopedSlots) {
            nodes = this.$scopedSlots.default!({
              response: this.response,
              loading: this.loading,
            })
          }
        }
      } else {
        if ('placeholder' in this.$scopedSlots) {
          nodes = this.$scopedSlots.placeholder!({})
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
  },
})
