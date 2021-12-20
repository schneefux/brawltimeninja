<template functional>
  <input
    v-bind="data.attrs"
    type="checkbox"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      // same as b-button
      'form-input transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50',
      'rounded font-semibold text-sm py-1 pl-2 border-2', {
        '': props.sm, // default
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 focus:ring-yellow-400 text-gray-200': props.dark,
    }]"
    :checked="props.value"
    @input="listeners.input && listeners.input($event.target.checked)"
  >
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    value: {
      type: Boolean
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
