<template>
  <progress
    :value="value"
    :max="max"
    class="w-full h-3 progress"
  >{{ value != undefined ? (Math.floor(100 * value / max) + '%') : '' }}</progress>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: Number,
      required: false,
    },
    max: {
      type: Number,
      required: false,
      default: 1,
    },
  },
})
</script>

<style lang="postcss" scoped>
.progress::-webkit-progress-bar {
  @apply rounded-full bg-contrast/10;
}

.progress::-webkit-progress-value {
  @apply rounded-full bg-primary-400;
}
</style>
