<template>
  <component
    :is="tag"
    :class="{
      'shimmer relative overflow-hidden before:block before:absolute before:h-full before:top-0 before:left-[-200px] before:w-[200px] before:bg-[linear-gradient(to_right,_transparent_0%,_rgb(var(--color-contrast))_50%,_transparent_100%)] before:animate-[load_1s_ease_infinite]': loading,
    }"
    :style="{
      width: widthPx != undefined ? widthPx + 'px' : undefined,
      height: heightPx != undefined ? heightPx + 'px' : undefined,
    }"
  ></component>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
@keyframes load {
  from {
    left: -150px;
  }
  to {
    left: 100%;
  }
}
</style>
