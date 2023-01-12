<template>
  <input
    v-model="value"
    type="number"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 ring-contrast/10 focus:ring-contrast/20 hover:ring-contrast/20 bg-contrast/5"
  >
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Number,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: number) { return true },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(v: number) {
        emit('update:modelValue', v)
      }
    })

    return {
      value,
    }
  },
})
</script>
