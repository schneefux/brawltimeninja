<template>
  <div>
    <div
      v-if="title != undefined"
      class="mt-8"
    >
      <h2 class="text-2xl font-semibold">
        {{ title }}
      </h2>
      <slot name="description"></slot>
    </div>

    <div
      class="mt-4 md:mx-8"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e),
        once: true,
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String
    },
    trackingId: {
      type: String
    },
    trackingPageId: {
      type: String
    },
  },
  methods: {
    trackScroll(visible: boolean, element: any): void {
      if (visible && this.trackingPageId != undefined && this.trackingId != undefined) {
        this.$gtag.event('scroll', {
          'event_category': this.trackingPageId,
          'event_label': this.trackingId,
        })
      }
    },
  },
})
</script>
