<template functional>
  <picture :class="props.wrapperClass">
    <source :srcset="parent.$config.mediaUrl + props.path + '.webp' + props.query(props)" type="image/webp" />
    <img
      :src="parent.$config.mediaUrl + props.path + (props.transparent ? '.png': '.jpg') + props.query(props)"
      :class="props.clazz"
      :style="props.ztyle"
      v-bind="data.attrs"
    />
  </picture>
</template>

<script lang="ts">
import Vue from 'vue'
import { encodeQuery } from '~/lib/util'

function query({ size }: { size: string|number|undefined }): string {
  const opts = {}
  if (size) {
    opts['size'] = size
  }
  return '?' + encodeQuery(opts)
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
    query: {
      type: Function,
      default: query,
    },
  },
})
</script>
