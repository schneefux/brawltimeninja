<template>
  <lazy-hydration-wrapper
    v-if="!hydrated"
    ref="wrapper"
  >
    <slot></slot>
  </lazy-hydration-wrapper>
  <template v-else>
    <slot></slot>
  </template>
</template>

<script lang="ts">
import { ref, computed, defineComponent, PropType } from 'vue'
import { LazyHydrationWrapper } from 'vue3-lazy-hydration'
import { useIntersectionObserver } from '@vueuse/core'

export default defineComponent({
  components: {
    LazyHydrationWrapper,
  },
  props: {
    hydrateWhenVisible: {
      type: Object as PropType<HTMLElement>,
      required: false,
    },
  },
  setup(props) {
    // never hydrate, instead rerender when visible to prevent hydration errors

    const wrapper = ref<InstanceType<typeof LazyHydrationWrapper>>()
    const hydrated = ref(false)

    if (!import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(computed(() => props.hydrateWhenVisible), ([ { isIntersecting } ]) => {
        if (isIntersecting) {
          hydrated.value = true
          stop()
        }
      }, {
        rootMargin: `50% 50% 50% 50%`,
      })

      if (!isSupported) {
        hydrated.value = true
      }
    }

    return {
      wrapper,
      hydrated,
    }
  },
})
</script>
