<template>
  <div
    :class="['p-1', size, {
      'w-48': xxxs,
      'w-64': xxs,
      'w-full max-w-xs': xs,
      'w-full max-w-sm': sm,
      'w-full max-w-md': md,
      'w-full max-w-lg': lg,
      'w-full max-w-xl': xl,
      'w-full max-w-2xl': xxl,
      'w-full max-w-3xl': xxxl,
      'w-full max-w-4xl': xxxxl,
    }]"
  >
    <card-content v-bind="$attrs">
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
import { defineComponent } from 'vue-demi'
import CardContent from './card-content.vue'

export default defineComponent({
  components: {
    CardContent,
  },
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
