<script lang="ts">
import { defineComponent, h } from 'vue-demi'
import { StaticProps } from '../../props'
import BCard from '../ui/b-card.vue'

/**
 * Visualisation component that wraps another one in a <b-card>, if the card prop is set.
 * Should be used internally to build visualisation components.
 */
export default defineComponent({
  components: {
    BCard,
  },
  props: {
    ...StaticProps,
    loading: {
      type: Boolean,
      required: true as true
    },
    component: {
      type: String,
      required: true
    },
  },
  setup(props, { slots }) {
    // TODO add 'open in dashboard' button
    return () => {
      if (props.card != undefined) {
        return h(BCard, {
          attrs: { // attrs instead of props because b-card is functional
            ...props.card as any,
            loading: props.loading,
          },
          scopedSlots: slots,
        })
      } else {
        const nodes = slots['content'] != undefined ? slots['content']() : undefined
        if (nodes == undefined) {
          return h()
        }
        if (nodes.length > 1) {
          // workaround because Vue does not allow returning multiple nodes from root
          return h('div', nodes)
        }
        return nodes[0]
      }
    }
  },
})
</script>
