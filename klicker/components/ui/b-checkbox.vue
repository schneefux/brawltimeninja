<template>
  <input
    type="checkbox"
    :checked="value"
    class="form-input rounded transition duration-100 ease-in-out focus:ring-0 bg-contrast/5 hover:bg-contrast/10 focus:bg-contrast/20 text-contrast/30 checked:text-contrast/40"
    @input="(e: any) => $emit('update:modelValue', e.target.checked)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    value: {
      type: Boolean
    },
  },
  emits: {
    ['update:modelValue'](value: boolean) { return true },
  },
})
</script>
