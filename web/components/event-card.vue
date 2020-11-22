<template>
  <card
    :title="mode != undefined ? formatMode(mode) : undefined"
    :title-link="mode != undefined ? `/tier-list/mode/${camelToKebab(mode)}` : undefined"
    :subtitle="map"
    :subtitle-link="map != undefined ? `/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}` : undefined"
    :background="background"
    :icon="mode != undefined ? '/modes/' + mode + '/icon' : undefined"
    :size="size"
    :color="mode != undefined ? 'color-' + mode.toLowerCase() : undefined"
  >
    <media-img
      slot="preview"
      v-if="id != undefined && id != 0"
      :path="`/maps/${id}`"
      size="80"
      clazz="h-12"
    ></media-img>

    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab, formatMode, slugify } from '../lib/util'

export default Vue.extend({
  props: {
    mode: {
      // camel case
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      // enables map icon top right
      type: [String, Number],
    },
    size: {
      // class
      type: String,
      default: 'w-80',
    },
    nobackground: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    formatMode() {
      return formatMode
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    background() {
      if (this.nobackground) {
        return undefined
      }
      const path = '/modes/' + this.mode + '/background'
      const query = '?size=800'
      const url = process.env.mediaUrl + path + (this.$supportsWebp ? '.webp' : '.jpg') + query
      return url
    },
  },
})
</script>
