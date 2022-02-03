<template>
  <component
    :is="tag || (to == undefined ? 'button' : 'nuxt-link')"
    v-on="$listeners"
    :class="{
      'rounded-2xl': !round,
      'rounded-full': round,
      'inline-block': to != undefined,
      'text-sm py-1 px-2 border-1': xs,
      'text-sm py-2 px-4 border-1': sm,
      'text-sm py-2 px-4 border-2': md,
      'py-4 px-8 border-4': lg,
      'bg-gray-700 border-gray-700 hover:bg-gray-600 hover:border-gray-600 focus:ring-gray-600 text-gray-200': dark,
      'bg-gray-300 border-gray-300 hover:bg-gray-200 hover:border-gray-200 focus:ring-gray-200 text-gray-800': light,
      'bg-primary-400 border-primary-400 hover:bg-primary-300 hover:border-primary-300 focus:ring-primary-300 text-gray-800': primary,
      'border-primary-600': primary && outline,
      'bg-secondary-600 border-secondary-600 hover:bg-secondary-500 hover:border-secondary-500 focus:ring-secondary-500 text-gray-200': secondary,
    }"
    :to="to"
    class="transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50 focus:outline-none font-semibold"
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
