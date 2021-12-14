<template functional>
  <div
    :class="['p-1', data.class, data.staticClass, props.size, {
      'w-48': props.xxxs,
      'w-64': props.xxs,
      'w-full max-w-xs': props.xs,
      'w-full max-w-sm': props.sm,
      'w-full max-w-md': props.md,
      'w-full max-w-lg': props.lg,
      'w-full max-w-xl': props.xl,
      'w-full max-w-2xl': props.xxl,
      'w-full max-w-3xl': props.xxxl,
      'w-full max-w-4xl': props.xxxxl,
    }]"
  >
    <card-content v-bind="data.attrs">
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="slotProps"
      >
        <slot
          :name="slot"
          v-bind="slotProps"
          :page="0"
          open
        ></slot>
      </template>
    </card-content>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  functional: true,
  props: {
    size: {
      type: String, // class
      default: ''
    },
    xxxs: {
      type: Boolean,
      default: false
    },
    xxs: {
      type: Boolean,
      default: false
    },
    xs: {
      type: Boolean,
      default: false
    },
    sm: {
      type: Boolean,
      default: false
    },
    md: {
      type: Boolean,
      default: false
    },
    lg: {
      type: Boolean,
      default: false
    },
    xl: {
      type: Boolean,
      default: false
    },
    xxl: {
      type: Boolean,
      default: false
    },
    xxxl: {
      type: Boolean,
      default: false
    },
    xxxxl: {
      type: Boolean,
      default: false
    },
  },
})
</script>
