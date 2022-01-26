<template>
  <input
    type="radio"
    v-bind="$attrs"
    :class="[
      'form-radio transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50', {
        'bg-gray-700 hover:bg-gray-600 border-gray-500 hover:border-gray-400 focus:ring-gray-400 text-gray-500 checked:text-gray-400': $props.dark,
        'bg-gray-300 hover:bg-yellow-300 border-gray-400 hover:border-yellow-400 focus:ring-yellow-400 text-yellow-400 checked:border-yellow-500': $props.primary,
    }]"
    :checked="$props.value == $props.modelValue"
    :value="$props.value"
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
