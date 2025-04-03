<template>
  <progress
    :value="value"
    :max="max"
    class="w-full h-3 progress-bar:rounded-full progress-bar:bg-contrast/10 progress-value:rounded-full progress-value:bg-primary-400"
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
