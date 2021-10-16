<template functional>
  <input
    type="text"
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      // same as b-button
      'form-input transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50',
      'rounded font-semibold text-sm py-1 pl-2 border-2', {
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 focus:ring-yellow-400 text-gray-200': props.dark,
    }]"
    :value="props.value"
    @input="listeners.input && listeners.input($event.target.value)"
  >
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
  },
})
</script>
