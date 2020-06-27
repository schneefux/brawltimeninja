<template>
  <picture>
    <source :srcset="url + '.webp' + query" type="image/webp">
    <img :src="url + (transparent ? '.png': '.jpg') + query" :class="clazz" :style="ztyle" v-bind="$attrs">
  </picture>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  inheritAttrs: false,
  props: {
    clazz: {
      type: String,
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
      type: String,
      required: false
    },
    transparent: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    url(): string {
      return process.env.mediaUrl + this.path
    },
    query(): string {
      const opts = {}
      if (this.size) {
        opts['size'] = this.size
      }
      return '?' + new URLSearchParams(opts).toString()
    },
  }
})
</script>
