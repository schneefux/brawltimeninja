<template>
  <select
    v-bind="$attrs"
    :class="[
      // same as b-button
      'rounded text-sm md:text-base py-1 pl-2 border-2', {
        '': $props.sm, // default
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200': $props.dark,
        'bg-yellow-400 hover:bg-yellow-300 border-yellow-400 hover:border-yellow-300 text-gray-800': $props.primary,
    }]"
    :value="$props.value"
    @input="$listeners.input && $listeners.input($event.target.value)"
  >
    <slot></slot>
  </select>
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
    sm: {
      type: Boolean
    },
    primary: {
      type: Boolean
    },
  },
})
</script>
