<template>
  <component
    :is="tag || (to == undefined ? 'button' : 'router-link')"
    :class="{
      'rounded-2xl': !round,
      'rounded-full': round,
      'inline-block': to != undefined,
      'text-sm py-1 px-3 border-1': xs,
      'text-sm py-2 px-4 border-1': sm,
      'text-sm py-2 px-4 border-2': md,
      'py-4 px-8 border-4': lg,
      'bg-contrast/10 border-contrast/10 hover:bg-border-contrast/25 hover:bg-contrast/25 focus:ring-text/50 text-text': light || dark,
      'bg-primary-400 border-primary-400 hover:bg-primary-300 hover:border-primary-300 focus:ring-primary-300/50 text-on-primary': primary,
      'border-primary-600': primary && outline,
      'bg-secondary-600 border-secondary-600 hover:bg-secondary-500 hover:border-secondary-500 focus:ring-secondary-500/50 text-on-secondary': secondary,
    }"
    :to="to"
    class="transition duration-100 ease-in-out focus:ring-3 focus:ring-offset-0 focus:outline-hidden font-semibold"
  >
    <slot></slot>
  </component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
