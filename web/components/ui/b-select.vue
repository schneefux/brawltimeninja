<template functional>
  <select
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      // same as b-button
      'rounded font-semibold text-sm py-1 pl-2 border-2', {
        '': props.sm, // default
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200': props.dark,
        'bg-gray-300 hover:bg-gray-400 border-gray-300 hover:border-gray-400 text-primary-dark': props.light,
    }]"
    :value="props.value"
    @input="listeners.input && listeners.input($event.target.value)"
  >
    <slot></slot>
  </select>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    value: {
      type: undefined
    },
    dark: {
      type: Boolean
    },
    light: {
      type: Boolean
    },
    sm: {
      type: Boolean
    },
  },
})
</script>
