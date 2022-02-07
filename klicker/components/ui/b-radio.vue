<template>
  <input
    type="radio"
    :class="{
      'bg-gray-300 hover:bg-primary-300 border-gray-400 hover:border-primary-400 focus:ring-primary-400 text-primary-400 checked:border-primary-500': primary,
    }"
    :checked="value == modelValue"
    :value="value"
    class="form-radio transition duration-100 ease-in-out focus:ring-0 bg-black/5 hover:bg-black/10 focus:bg-black/20 text-black/30 checked:text-black/40 dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-white/20 dark:text-white/30 dark:checked:text-white/40"
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
    primary: {
      type: Boolean,
      required: false
    },
  },
})
</script>
