<template functional>
  <component
    :is="props.tag || (props.to == undefined ? 'button' : 'nuxt-link')"
    v-bind="data.attrs"
    v-on="listeners"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      'rounded font-semibold text-sm py-1 px-2 border-2', {
        'inline-block': props.to != undefined,
        'text-xs py-px px-1 border-1': props.xs,
        '': props.sm, // default
        'border-4 text-md': props.md,
        'border-8': props.lg,
        'bg-gray-900 hover:bg-gray-700 border-gray-700 hover:border-primary text-white': !props.light && !props.primary && !props.secondary,
        'border-primary-dark': !props.primary && !props.secondary && props.selected,
        'bg-gray-300 hover:bg-gray-400 border-gray-300 hover:border-gray-400 text-primary-dark': props.light,
        'bg-primary hover:bg-primary-light border-primary hover:border-primary-light text-gray-200': props.primary,
        'bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-black': props.secondary,
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
    light: {
      type: Boolean
    },
    primary: {
      type: Boolean
    },
    secondary: {
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
