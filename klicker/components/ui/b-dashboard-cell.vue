<template>
  <div
    ref="cell"
    :class="{
      'hide-empty': hideEmpty && visible,
    }"
    :style="{
      '--rows': rows,
      '--columns': columns,
    }"
    class="dashboard__cell"
  >
    <slot v-if="visible"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

export default defineComponent({
  props: {
    rows: {
      type: Number,
      default: 1
    },
    columns: {
      type: Number,
      default: 1
    },
    hideEmpty: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const cell = ref<HTMLElement|null>()
    const visible = ref(!props.lazy)
    if (!visible.value && !import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(cell, ([{ isIntersecting }]) => {
        if (isIntersecting) {
          visible.value = isIntersecting
          stop()
        }
      }, {
        rootMargin: `50% 50% 50% 50%`,
      })
      if (!isSupported) {
        visible.value = true
      }
    }

    return {
      cell,
      visible,
    }
  },
})
</script>

<style scoped lang="postcss">
.hide-empty:empty {
  display: none;
}
</style>
