<template>
  <div
    ref="cell"
    :class="{
      'hide-empty': hideEmpty && visible,
    }"
    :style="`--rows: ${rows}; --columns: ${columns};`"
    class="dashboard__cell"
  >
    <slot v-if="visible"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useLazyHydration } from '../../composables/lazy-hydration'

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
    ssrKey: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const { wrapper: cell, hydrated: visible } = useLazyHydration(props.lazy, {
      rootMargin: `50% 50% 50% 50%`
    })

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
