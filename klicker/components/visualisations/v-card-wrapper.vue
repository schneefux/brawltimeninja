<script lang="ts">
import { defineComponent, h } from 'vue'
import { StaticProps } from '../../props'
import BCard from '../ui/b-card.vue'
import BBigstat from '../ui/b-bigstat.vue'

/**
 * Visualisation component that wraps another one in a <b-card>, if the card prop is set.
 * Should be used internally to build visualisation components.
 */
export default defineComponent({
  components: {
    BBigstat,
    BCard,
  },
  props: {
    ...StaticProps,
    loading: {
      type: Boolean,
      required: true
    },
    component: {
      type: String,
      required: true
    },
    wrapper: {
      type: String,
      default: 'b-card'
    },
  },
  setup(props, { slots }) {
    // TODO add 'open in dashboard' button
    return () => {
      if (props.card != undefined && props.card !== false) {
        return h(props.wrapper, {
          props: {
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
