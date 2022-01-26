<template>
  <input
    v-bind="$attrs"
    type="checkbox"
    :class="[
      'form-input transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50',
      'rounded border-2', {
        'bg-gray-700 hover:bg-gray-600 border-gray-500 hover:border-gray-400 focus:ring-gray-400 text-gray-500 checked:text-gray-400': $props.dark,
    }]"
    :checked="$props.value"
    @input="$listeners.input && $listeners.input($event.target.checked)"
  >
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    value: {
      type: Boolean
    },
    dark: {
      type: Boolean
    },
  },
})
</script>
