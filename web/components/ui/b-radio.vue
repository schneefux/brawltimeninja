<template functional>
  <input
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      'form-radio transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50', {
      'bg-gray-300 hover:bg-yellow-300 border-gray-300 hover:border-yellow-300 focus:ring-yellow-300 text-yellow-400': props.primary,
    }]"
    :value="props.value"
    type="radio"
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
    primary: {
      type: Boolean
    },
  },
})
</script>
