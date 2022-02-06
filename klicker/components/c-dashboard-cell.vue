<template>
  <div
    ref="cell"
    :class="{
      'hide-empty': hideEmpty && !lazy,
    }"
    :style="`--rows: ${rows}; --columns: ${columns};`"
    class="dashboard__cell"
  >
    <slot v-if="visible"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import { useIntersectionObserver } from '@vueuse/core'
import { ssrRef } from '@nuxtjs/composition-api'

// :style object syntax does not work for some reason - Nuxt silently swallows the variables

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
    const cell = ref(null)
    const visible = ssrRef != undefined ? ssrRef(!props.lazy) : ref(!props.lazy)

    if ((<any>process).server) {
      visible.value = true
    }

    if (!visible.value) {
      const { isSupported, stop } = useIntersectionObserver(cell, ([{ isIntersecting }], observerElement) => {
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
