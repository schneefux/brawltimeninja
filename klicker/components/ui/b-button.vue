<template>
  <component
    :is="$props.tag || ($props.to == undefined ? 'button' : 'nuxt-link')"
    v-bind="$attrs"
    v-on="$listeners"
    :class="['font-semibold',
      'transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50 focus:outline-none', {
      'rounded': !$props.round,
      'rounded-full': $props.round,
      'inline-block': $props.to != undefined,
      'text-xs py-px px-1 border-2': $props.xs,
      'text-sm py-1 px-2 border-2': $props.sm,
      'text-base py-1 px-2 border-4': $props.md,
      'text-lg py-1 px-2 border-8': $props.lg,
      'bg-gray-700 hover:bg-gray-600 border-gray-700 hover:border-gray-600 focus:ring-gray-600 text-gray-200': $props.dark,
      'bg-gray-300 hover:bg-gray-200 border-gray-300 hover:border-gray-200 focus:ring-gray-200 text-gray-800': $props.light,
      'bg-primary-400 hover:bg-primary-300 border-primary-400 hover:border-primary-300 focus:ring-primary-300 text-gray-800': $props.primary,
      'border-primary-600': $props.primary && $props.outline,
      'bg-secondary-600 hover:bg-secondary-500 border-secondary-600 hover:border-secondary-500 focus:ring-secondary-500 text-gray-200': $props.secondary,
    }]"
    :to="$props.to"
  >
    <slot></slot>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

export default defineComponent({
  props: {
    tag: {
      type: String,
      required: false
    },
    to: {
      type: [String, Object],
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
