<template functional>
  <component
    :is="props.tag || (props.to == undefined ? 'button' : 'nuxt-link')"
    v-bind="data.attrs"
    v-on="listeners"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass, 'font-semibold',
      'transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50 focus:outline-none', {
      'rounded': !props.round,
      'rounded-full': props.round,
      'inline-block': props.to != undefined,
      'text-xs py-px px-1 border-2': props.xs,
      'text-sm py-1 px-2 border-2': props.sm,
      'text-base py-1 px-2 border-4': props.md,
      'text-lg py-1 px-2 border-8': props.lg,
      'bg-gray-700 hover:bg-gray-500 border-gray-500 hover:border-yellow-400 focus:ring-yellow-400 text-gray-200': props.dark,
      'border-yellow-400': props.dark && props.selected,
      'bg-gray-300 hover:bg-gray-400 border-gray-300 hover:border-gray-400 focus:ring-gray-400 text-primary-dark': props.light,
      'bg-yellow-400 hover:bg-yellow-300 border-yellow-400 hover:border-yellow-300 focus:ring-yellow-300 text-gray-800': props.primary,
      'border-yellow-600': props.primary && props.outline,
      'bg-red-600 hover:bg-red-500 border-red-600 hover:border-red-500 focus:ring-red-500 text-gray-200': props.secondary,
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
      type: String,
      required: false
    },
    to: {
      type: [String, Object],
      required: false
    },
    selected: {
      type: Boolean,
      required: false
    },
    outline: {
      type: Boolean,
      required: false
    },
    round: {
      type: Boolean,
      required: false
    },
    dark: {
      type: Boolean,
      required: false
    },
    light: {
      type: Boolean,
      required: false
    },
    primary: {
      type: Boolean,
      required: false
    },
    secondary: {
      type: Boolean,
      required: false
    },
    link: {
      type: Boolean,
      required: false
    },
    xs: {
      type: Boolean,
      required: false
    },
    sm: {
      type: Boolean,
      required: false
    },
    md: {
      type: Boolean,
      required: false
    },
    lg: {
      type: Boolean,
      required: false
    },
  },
})
</script>
