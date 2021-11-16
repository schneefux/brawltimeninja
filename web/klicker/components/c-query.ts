import Vue, { PropType, VNode } from 'vue'
import { State, CubeResponse } from '~/klicker'

export default Vue.extend({
  name: 'c-query',
  props: {
    state: {
      type: Object as PropType<State>,
      required: true
    },
  },
  data() {
    return {
      loading: false,
      response: undefined as undefined|CubeResponse,
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
      this.response = await this.$klicker.query(this.state)
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
    if ('default' in this.$scopedSlots && this.response != undefined) {
      nodes = this.$scopedSlots.default!({
        query: this.response,
        loading: this.loading,
      })
    }

    if ('empty' in this.$scopedSlots && this.response != undefined && this.response.data.length == 0) {
      nodes = this.$scopedSlots.empty!({})
    }

    if ('placeholder' in this.$scopedSlots && this.response == undefined) {
      nodes = this.$scopedSlots.placeholder!({})
    }

    if ('error' in this.$scopedSlots && this.error) {
      nodes = this.$scopedSlots.error!({})
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
