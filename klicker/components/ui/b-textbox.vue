<template>
  <input
    type="text"
    v-bind="$attrs"
    :class="[
      'form-input transition duration-100 ease-in-out ring-0 focus:ring focus:ring-offset-0 focus:ring-opacity-50',
      'rounded py-1 px-2 border-2', {
        'bg-gray-700 hover:bg-gray-600 border-gray-500 hover:border-gray-400 focus:border-gray-400 focus:ring-gray-400 text-gray-200': $props.dark,
    }]"
    :value="$props.value"
    @input="$listeners.input && $listeners.input($event.target.value)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    value: {
      type: undefined
    },
    dark: {
      type: Boolean
    },
  },
})
</script>
