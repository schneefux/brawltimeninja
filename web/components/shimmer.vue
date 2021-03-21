<template functional>
  <component
    :is="props.tag"
    :class="[data.class, data.staticClass, {
      'relative overflow-hidden shimmer': props.loading,
    }]"
    :style="[{
      width: props.widthPx != undefined ? props.widthPx + 'px' : undefined,
      height: props.heightPx != undefined ? props.heightPx + 'px' : undefined,
    }, data.staticStyle]"
  >
    <slot v-if="!props.loading"></slot>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Shimmer',
  functional: true,
  props: {
    tag: {
      type: String,
      default: 'div'
    },
    loading: {
      type: Boolean,
    },
    widthPx: {
      type: [Number, String],
    },
    heightPx: {
      type: [Number, String],
    },
  },
})
</script>

<style lang="postcss" scoped>
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
