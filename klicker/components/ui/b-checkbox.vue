<template>
  <input
    v-model="value"
    type="checkbox"
    class="form-input rounded transition duration-100 ease-in-out focus:ring-0 bg-contrast/5 hover:bg-contrast/10 focus:bg-contrast/20 text-contrast/30 checked:text-contrast/40"
  >
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: boolean) { return true },
  },
  setup(props, { emit }) {
    const value = computed({
      get() {
        return props.modelValue
      },
      set(v: boolean) {
        emit('update:modelValue', v)
      }
    })

    return {
      value,
    }
  },
})
</script>
