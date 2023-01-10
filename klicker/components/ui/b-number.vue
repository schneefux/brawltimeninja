<template>
  <input
    type="number"
    :value="modelValue"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 ring-contrast/10 focus:ring-contrast/20 hover:ring-contrast/20 bg-contrast/5"
    @input="(e: any) => $emit('update:modelValue', parseInt(e.target.value))"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Number
    },
  },
  emits: {
    ['update:modelValue'](value: number) { return true },
  },
})
</script>
