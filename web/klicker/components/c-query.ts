import Vue, { PropType, VNode } from 'vue'
import { State, CubeResponse, TestState, CubeResponseTest } from '~/klicker'

// TODO accept `query` as prop.
// If query.state corresponds to a state that should be fetched, re-use it.
// Or just rely on browser caching instead?
export default Vue.extend({
  name: 'c-query',
  props: {
    state: {
      type: Object as PropType<TestState|State>,
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
    state: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.error = false
    this.loading = true
    try {
      if (!('comparingMeasurementId' in this.state)) {
        this.response = await this.$klicker.query(this.state)
      } else {
        this.response = await this.$klicker.comparingQuery(this.state)
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
              query: this.response,
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
