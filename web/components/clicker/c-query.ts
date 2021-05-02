import Vue, { PropType, VNode } from 'vue'
import { State } from '~/lib/cube'
import { CubeResponse } from '~/plugins/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    state: {
      type: Object as PropType<State>,
      required: true
    },
    limit: {
      type: Number
    },
    includeMeta: {
      type: Boolean
    },
  },
  data() {
    return {
      loading: false,
      result: undefined as undefined|CubeResponse,
    }
  },
  watch: {
    state: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.loading = true
    this.result = await this.$cube.query(this.state, this.limit, this.includeMeta)
    this.loading = false
  },
  render(h): VNode {
    let nodes: VNode[] | undefined

    if ('default' in this.$scopedSlots && this.result != undefined) {
      nodes = this.$scopedSlots.default!({
        state: this.state,
        comparing: this.state.comparing,
        loading: this.loading,
        data: this.result.data,
        dimensions: this.result.dimensions,
        measurements: this.result.measurements,
        ...this.$attrs,
      })
    }

    if ('empty' in this.$scopedSlots && this.result != undefined && this.result.data.length == 0) {
      nodes = this.$scopedSlots.empty!({
        ...this.$attrs,
      })
    }

    if ('placeholder' in this.$scopedSlots && this.result == undefined) {
      nodes = this.$scopedSlots.placeholder!({
        ...this.$attrs,
      })
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
