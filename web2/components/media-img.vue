<template functional>
  <picture :class="props.wrapperClass">
    <source
      v-if="!props.animated"
      :srcset="props.genUrl(parent, 'webp', props)"
      type="image/webp"
    >
    <img
      :src="props.genUrl(parent, props.animated ? 'gif' : (props.transparent ? 'png' : 'jpg'), props)"
      :class="props.clazz"
      :style="props.ztyle"
      v-bind="data.attrs"
    >
  </picture>
</template>

<script lang="ts">
import Vue from 'vue'

function genUrl(parent: any, format: string, props: any, factor: number = 1.0): string {
  let query = ''

  if (props.size) {
    query += `?size=${props.size * factor}`
  }

  return `${parent.$config.mediaUrl}${props.path}.${format}${query}`
}

export default Vue.extend({
  functional: true,
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
    genUrl: {
      type: Function,
      default: genUrl,
    }
  },
})
</script>
