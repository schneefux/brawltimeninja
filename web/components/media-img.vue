<template>
  <picture>
    <source :srcset="url + '.webp'" type="image/webp">
    <img :src="url + (transparent ? '.png': '.jpg') + query" :alt="alt" :class="clazz">
  </picture>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    clazz: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    },
    size: {
      required: false
    },
    alt: {
      type: String,
      default: ''
    },
    transparent: {
      type: Boolean,
      default: true
    },
  },
  computed: {
    url() {
      return process.env.mediaUrl + this.path
    },
    query() {
      return this.size ? '?size=' + this.size : ''
    },
  }
}
</script>
