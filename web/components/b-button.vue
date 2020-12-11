<template functional>
  <component
    :is="props.tag || (props.to == undefined ? 'button' : 'nuxt-link')"
    v-bind="data.attrs"
    v-on="listeners"
    :style="data.staticStyle"
    :class="[data.class, data.staticClass,
      'rounded font-semibold text-sm py-1 px-2 border-2', {
        'border-4 text-md': props.md,
        'py-px px-1': props.xs,
        'bg-gray-900 hover:bg-gray-700 border-gray-700 hover:border-primary text-white': !props.light && !props.secondary,
        'bg-gray-300 hover:bg-gray-400 border-gray-300 hover:border-gray-400 text-primary-dark': props.light,
        'bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-black': props.secondary,
      }
    ]"
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
      type: String
    },
    light: {
      type: Boolean
    },
    secondary: {
      type: Boolean
    },
    xs: {
      type: Boolean
    },
    md: {
      type: Boolean
    },
  },
})
</script>
