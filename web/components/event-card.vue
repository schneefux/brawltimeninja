<template>
  <card
    :title="$attrs.title || map || (mode != undefined ? $t('mode.' + mode) : undefined)"
    :title-link="mode != undefined ? localePath(`/tier-list/mode/${camelToKebab(mode)}`) : undefined"
    :subtitle="id != undefined ? (id != 0 ? $t('map.' + id) : map) : undefined"
    :subtitle-link="map != undefined ? localePath(`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`) : undefined"
    :background="background"
    :icon="mode != undefined ? '/modes/' + camelToKebab(mode) + '/icon' : undefined"
    :color="mode != undefined ? 'color-' + mode.toLowerCase() : undefined"
    v-bind="$attrs"
  >
    <media-img
      slot="preview"
      v-if="id != undefined"
      :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
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
import { camelToKebab, slugify } from '@/lib/util'

export default Vue.extend({
  inheritAttrs: false,
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
    nobackground: {
      type: Boolean
    },
  },
  computed: {
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    background(): string|undefined {
      if (this.nobackground) {
        return undefined
      }
      const path = '/modes/' + this.mode + '/background'
      const query = '?size=800'
      const url = this.$config.mediaUrl + path + (this.$supportsWebp ? '.webp' : '.jpg') + query
      return url
    },
  },
})
</script>
