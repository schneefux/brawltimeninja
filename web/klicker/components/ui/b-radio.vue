<template functional>
  <input
    type="radio"
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      'form-radio transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50', {
      'bg-gray-300 hover:bg-yellow-300 border-gray-300 hover:border-yellow-300 focus:ring-yellow-300 text-yellow-400': props.primary,
    }]"
    :checked="props.value == props.modelValue"
    :value="props.value"
    @input="listeners.input && listeners.input($event.target.value)"
  >
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  functional: true,
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
      type: Boolean
    },
  },
})
</script>
