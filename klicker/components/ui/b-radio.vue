<template>
  <input
    type="radio"
    :class="{
      'bg-gray-300 hover:bg-primary-300 border-gray-400 hover:border-primary-400 focus:ring-primary-400 text-primary-400 checked:border-primary-500': primary,
      'bg-contrast/5 hover:bg-contrast/10 focus:bg-contrast/20 text-contrast/30 checked:text-contrast/40': !primary,
    }"
    :checked="value == modelValue"
    :value="value"
    class="form-radio transition duration-100 ease-in-out focus:ring-0"
    @input="onInput"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: undefined,
      default: '' as any
    },
    value: {
      type: undefined,
      default: '' as any
    },
    primary: {
      type: Boolean,
      required: false
    },
  },
  emits: {
    ['update:modelValue'](value: any) { return true },
  },
  setup(props, { emit }) {
    const onInput = (e: Event) => {
      emit('update:modelValue', props.value)
    }

    return {
      onInput,
    }
  },
})
</script>
