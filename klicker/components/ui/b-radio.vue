<template>
  <input
    type="radio"
    :class="{
      'bg-white/5 hover:bg-white/10 focus:bg-white/20 text-white/30 checked:text-white/40': dark,
      'bg-gray-300 hover:bg-primary-300 border-gray-400 hover:border-primary-400 focus:ring-primary-400 text-primary-400 checked:border-primary-500': primary,
    }"
    :checked="value == modelValue"
    :value="value"
    class="form-radio transition duration-100 ease-in-out focus:ring-0"
    @input="$listeners.input && $listeners.input($event.target.value)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  model: {
    prop: 'modelValue',
  },
  props: {
    modelValue: {
      type: undefined,
      default: ''
    },
    value: {
      type: undefined,
      default: ''
    },
    dark: {
      type: Boolean,
      required: false
    },
    primary: {
      type: Boolean,
      required: false
    },
  },
})
</script>
