<template>
  <div v-if="render || visible" :class="{ 'contents': translucent }">
    <slot></slot>
  </div>
  <!--
    TODO it would be better to render the default slot
    but nuxt re-renders on the client which creates a mismatch
  -->
  <div v-else-if="isServer">
    <slot name="placeholder"></slot>
  </div>
  <div v-else-if="!supportsIntersectionObserver" :class="{ 'contents': translucent }">
    <slot></slot>
  </div>
  <div v-else v-observe-visibility="{ callback, intersection, once: true }">
    <slot name="placeholder"></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    render: {
      // manual override
      type: Boolean,
      default: false
    },
    distance: {
      type: String,
      default: '500px'
    },
    translucent: {
      type: Boolean
    },
  },
  data() {
    return {
      visible: this.render,
    }
  },
  computed: {
    isServer(): boolean {
      return process.server
    },
    supportsIntersectionObserver(): boolean {
      return process.client && 'IntersectionObserver' in window
    },
    intersection() {
      return {
        rootMargin: `${this.distance} ${this.distance} ${this.distance} ${this.distance}`,
      }
    },
  },
  methods: {
    callback(visible: boolean) {
      if (visible) {
        this.visible = true
        this.$emit('visible', true)
      }
    },
  },
})
</script>
