<template>
  <component
    :is="tag"
    :class="{
      'relative overflow-hidden shimmer': loading,
    }"
    :style="{
      width: widthPx != undefined ? widthPx + 'px' : undefined,
      height: heightPx != undefined ? heightPx + 'px' : undefined,
    }"
  >
    <slot v-if="!loading"></slot>
  </component>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  name: 'Shimmer',
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    loading: {
      type: Boolean,
      default: false
    },
    widthPx: {
      type: [Number, String],
      required: false
    },
    heightPx: {
      type: [Number, String],
      required: false
    },
  },
})
</script>

<style lang="postcss">
.shimmer::before {
  content: '';
  @apply block absolute h-full top-0;
  left: -200px;
  width: 200px;
  background: linear-gradient(to right, transparent 0%, theme('colors.gray.800') 50%, transparent 100%);
  animation: load 1s ease;
  animation-iteration-count: infinite;
}

@keyframes load {
  from {
    left: -150px;
  }
  to {
    left: 100%;
  }
}
</style>
