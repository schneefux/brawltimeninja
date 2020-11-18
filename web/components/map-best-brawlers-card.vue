<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="!large && id != undefined ? id : undefined"
  >
    <!-- large, endDate, startDate are mutually exclusive -->
    <media-img
      v-if="large && id != undefined"
      slot="infobar"
      :path="'/maps/' + id"
      size="384"
      clazz="h-48 mx-auto"
      itemprop="image"
    ></media-img>
    <div
      v-if="powerplay || endDate != undefined || startDate != undefined"
      slot="infobar"
      class="flex justify-end"
    >
      <span v-if="powerplay" class="mr-auto">
        Power Play
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
      class="my-4"
    ></map-best-brawlers>

    <template v-if="link" v-slot:actions>
      <div class="flex justify-end">
        <nuxt-link
          :to="id != undefined ? `/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}` : `/tier-list/mode/${camelToKebab(mode)}`"
          class="card__action"
        >
          Open
        </nuxt-link>
      </div>
    </template>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab, slugify } from '../lib/util'
import { parseISO, formatDistanceToNow } from 'date-fns'

export default Vue.extend({
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
      required: false
    },
    startDate: {
      type: String,
      required: false
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: false
    },
    id: {
      type: [Number, String],
      required: false
    },
    powerplay: {
      type: Boolean,
      required: false
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
