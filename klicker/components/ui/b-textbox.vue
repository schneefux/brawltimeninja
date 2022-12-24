<template>
  <input
    type="text"
    :value="modelValue"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 focus:ring-contrast/20 ring-contrast/10 hover:ring-contrast/20 bg-contrast/5"
    @input="$emit('update:modelValue', $event.target?.value)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: undefined
    },
  },
  emits: ['update:modelValue'],
})
</script>
