<template>
  <input
    type="text"
    v-model="value"
    class="form-input transition duration-100 ease-in-out rounded-2xl py-2 px-4 border-none ring-2 focus:ring-2 focus:ring-contrast/20 ring-contrast/10 hover:ring-contrast/20 bg-contrast/5"
  >
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: string) { return true },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(v: string) {
        emit('update:modelValue', v)
      }
    })

    return {
      value,
    }
  },
})
</script>
