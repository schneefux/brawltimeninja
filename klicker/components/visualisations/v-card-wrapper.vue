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
      const wrappers = {
        'b-card': BCard,
        'b-bigstat': BBigstat,
      }
      const wrapperComponent = wrappers[props.wrapper]
      if (props.card != undefined && props.card !== false) {
        return h(wrapperComponent, {
          props: {
            ...props.card as any,
            loading: props.loading,
          },
        }, slots)
      } else {
        const nodes = slots['content'] != undefined ? slots['content']() : []
        return nodes
      }
    }
  },
})
</script>
