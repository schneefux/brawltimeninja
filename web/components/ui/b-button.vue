<template functional>
  <component
    :is="props.tag || (props.to == undefined ? 'button' : 'nuxt-link')"
    v-bind="data.attrs"
    v-on="listeners"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass, 'font-semibold', {
      'rounded': !props.round,
      'rounded-full': props.round,
      'inline-block': props.to != undefined,
      'text-xs py-px px-1 border-2': props.xs,
      'text-sm py-1 px-2 border-2': props.sm,
      'text-base py-1 px-2 border-4': props.md,
      'text-lg py-1 px-2 border-8': props.lg,
      'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 text-gray-200': props.dark,
      'border-yellow-400': props.dark && props.selected,
      'bg-gray-300 hover:bg-gray-400 border-gray-300 hover:border-gray-400 text-primary-dark': props.light,
      'bg-yellow-400 hover:bg-yellow-300 border-yellow-400 hover:border-yellow-300 text-gray-800': props.primary,
      'border-yellow-600': props.primary && props.outline,
      'bg-red-600 hover:bg-red-500 border-red-600 hover:border-red-500 text-gray-200': props.secondary,
    }]"
    :to="props.to"
  >
    <slot></slot>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    tag: {
      type: String
    },
    to: {
      type: [String, Object]
    },
    selected: {
      type: Boolean
    },
    outline: {
      type: Boolean
    },
    round: {
      type: Boolean
    },
    dark: {
      type: Boolean
    },
    light: {
      type: Boolean
    },
    primary: {
      type: Boolean
    },
    secondary: {
      type: Boolean
    },
    link: {
      type: Boolean
    },
    xs: {
      type: Boolean
    },
    sm: {
      type: Boolean
    },
    md: {
      type: Boolean
    },
    lg: {
      type: Boolean
    },
  },
})
</script>
