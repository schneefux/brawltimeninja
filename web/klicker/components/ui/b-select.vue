<template functional>
  <select
    v-bind="data.attrs"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      // same as b-button
      'rounded font-semibold text-sm py-1 pl-2 border-2', {
        '': props.sm, // default
        'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200': props.dark,
        'bg-yellow-400 hover:bg-yellow-300 border-yellow-400 hover:border-yellow-300 text-gray-800': props.primary,
    }]"
    :value="props.value"
    @input="listeners.input && listeners.input($event.target.value)"
  >
    <slot></slot>
  </select>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
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
    primary: {
      type: Boolean
    },
  },
})
</script>
