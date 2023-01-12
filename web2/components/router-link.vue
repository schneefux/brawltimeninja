<template>
  <a :href="href">
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useRouter, Route } from '@/composables/compat'

export default defineComponent({
  props: {
    to: {
      type: [String, Object] as PropType<Route>,
      required: true,
    },
  },
  setup(props) {
    const { routeToPath } = useRouter()
    const href = computed(() => routeToPath(props.to))

    return {
      href,
    }
  },
})
</script>
