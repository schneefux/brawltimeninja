<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="!large && id != undefined && id != 0 ? id : undefined"
    v-bind="$attrs"
  >
    <!-- large, endDate, startDate are mutually exclusive -->
    <media-img
      v-if="large && id != undefined && id != 0"
      slot="infobar"
      :path="'/maps/' + id"
      size="384"
      clazz="h-48 mx-auto"
      itemprop="image"
    ></media-img>
    <div
      v-if="powerplay || id == 0 || endDate != undefined || startDate != undefined"
      slot="infobar"
      class="flex justify-end"
    >
      <span v-if="id == 0" class="mr-auto">
        {{ $tc('thing.competition-map', 1) }}
      </span>
      <span v-if="powerplay" class="mr-auto">
        {{ $tc('thing.power-play', 1) }}
      </span>
      <span v-if="endDate != undefined">
        {{ endDateString }}
      </span>
      <span v-if="startDate != undefined">
        {{ startDateString }}
      </span>
    </div>

    <map-best-brawlers
      slot="content"
      :mode="mode"
      :map="map"
      :powerplay="powerplay"
      class="my-4"
      elevation="2"
    ></map-best-brawlers>

    <b-button
      v-if="link"
      slot="actions"
      :to="map != undefined ? localePath(`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`) : localePath(`/tier-list/mode/${camelToKebab(mode)}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open') }}
    </b-button>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab, slugify } from '@/lib/util'
import { parseISO, formatDistanceToNow } from 'date-fns'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    large: {
      type: Boolean,
      default: false
    },
    link: {
      type: Boolean,
      default: false
    },
    endDate: {
      type: String,
    },
    startDate: {
      type: String,
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
    },
    id: {
      type: [Number, String],
    },
    powerplay: {
      type: Boolean,
    },
  },
  computed: {
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    endDateString(): string {
      if (this.endDate == undefined) {
        return ''
      }

      const date = parseISO(this.endDate)
      return 'ends in ' + formatDistanceToNow(date)
    },
    startDateString(): string {
      if (this.startDate == undefined) {
        return ''
      }

      const date = parseISO(this.startDate)
      return 'starts in ' + formatDistanceToNow(date)
    },
  },
})
</script>
