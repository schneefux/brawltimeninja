<template>
  <select
    v-model="value"
    class="max-w-full form-select transition duration-100 ease-in-out rounded-2xl py-2 pl-4 pr-10 border-none bg-contrast/5 ring-2 ring-contrast/10 focus:ring-2 focus:ring-contrast/20 hover:ring-contrast/20 style-options"
  >
    <slot></slot>
  </select>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: undefined,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: any) { return true },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(v: any) {
        emit('update:modelValue', v)
      }
    })

    return {
      value,
    }
  }
})
</script>

<style scoped lang="postcss">
.style-options option {
  @apply py-1 px-px bg-background text-text;
}
</style>
