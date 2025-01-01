<script lang="ts">
import { defineComponent, h, resolveComponent, Component } from 'vue'
import { StaticProps } from '../../props'
import BCard from '../ui/b-card.vue'
import BBigstat from '../ui/b-bigstat.vue'

/**
 * Visualisation component that wraps another one in a <b-card>, if the card prop is set.
 * Should be used internally to build visualisation components.
 *
 * @deprecated use useVWrapper instead for better performance
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
        const wrapperComponent = resolveComponent(props.wrapper) as Component
        return h(wrapperComponent, {
          ...props.card,
          loading: props.loading,
        }, slots)
      } else {
        const nodes = slots['content'] != undefined ? slots['content']() : []
        if (nodes.length > 1) {
          // TODO remove this wrapper
          return h('div', nodes)
        }
        return nodes[0]
      }
    }
  },
})
</script>
