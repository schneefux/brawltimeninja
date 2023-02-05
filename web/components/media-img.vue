<template>
  <picture :class="wrapperClass">
    <source
      v-if="!animated"
      :srcset="webpSrc"
      type="image/webp"
    >
    <img
      :src="src"
      :class="clazz"
      :style="ztyle"
      v-bind="$attrs"
    >
  </picture>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useConfig } from "@/composables/compat";

function genUrl(mediaUrl: string, format: string, props: any, factor: number = 1.0): string {
  let query = ''

  if (props.size) {
    query += `?size=${props.size * factor}`
  }

  return `${mediaUrl}${props.path}.${format}${query}`
}

export default defineComponent({
  inheritAttrs: false,
  props: {
    clazz: {
      type: [String, Object],
      default: ''
    },
    wrapperClass: {
      type: [String, Object],
      default: ''
    },
    ztyle: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: [String, Number],
      required: false
    },
    transparent: {
      type: Boolean,
      default: true
    },
    animated: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const $config = useConfig()
    const webpSrc = computed(() => genUrl($config.mediaUrl, 'webp', props))
    const src = computed(() => genUrl($config.mediaUrl, props.animated ? 'gif' : (props.transparent ? 'png' : 'jpg'), props))

    return {
      webpSrc,
      src,
    }
  },
})
</script>
