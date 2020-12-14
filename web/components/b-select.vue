<template functional>
  <select
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      // same as b-button
      'rounded font-semibold text-sm py-1 pl-2 border-2', {
        '': props.sm, // default
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-white': props.dark,
    }]"
    :value="props.value"
    @input="listeners.input && listeners.input($event.target.selectedOptions[0].value)"
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
    sm: {
      type: Boolean
    },
  },
})
</script>
