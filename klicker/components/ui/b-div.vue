<script lang="ts">
import { defineComponent, h } from 'vue'

export default defineComponent({
  setup(props, { slots }) {
    return () => {
      const nodes = slots['content'] != undefined ? slots['content']() : []
      if (nodes.length > 1) {
        // TODO remove this wrapper
        return h('div', nodes)
      }
      return nodes[0]
    }
  },
})
</script>
