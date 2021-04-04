<template>
  <div
    class="grid grid-cols-1 lg:grid-cols-2 justify-items-center"
    :class="{
      '2xl:grid-cols-4': id != undefined,
      '2xl:grid-cols-3': id == undefined,
    }"
  >
    <card
      v-if="id != undefined"
      :title="$t('map.' + id)"
      md
    >
      <div
        slot="content"
        class="flex flex-wrap justify-center"
      >
        <p class="w-full">{{ $t('tier-list.map.last-online', { time: lastOnlineString }) }}</p>
        <media-img
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'image'),
            once: true,
          }"
          :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
          size="512"
          clazz="h-auto"
        ></media-img>
      </div>
    </card>

    <map-best-brawlers-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'brawlers'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      :id="id"
      full-height
      md
    ></map-best-brawlers-table>

    <map-best-teams-table
      v-if="mode != 'soloShowdown'"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'teams'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      :id="id"
      full-height
      md
    ></map-best-teams-table>

    <map-best-players-table
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'leaderboard'),
        once: true,
      }"
      :mode="mode"
      :map="map"
      :id="id"
    ></map-best-players-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

import { enUS, de } from 'date-fns/locale'
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
const locales = { en: enUS, de: de }

export default Vue.extend({
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: String
    },
    timestamp: {
      type: String
    },
    gaCategory: {
      type: String
    },
  },
  computed: {
    lastOnlineString(): string {
      if (this.timestamp == undefined) {
        return ''
      }
      const date = parseISO(this.timestamp)
      if (differenceInMinutes(new Date(), date) < 60) {
        return this.$tc('state.event-active')
      }
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locales[this.$i18n.locale],
      })
    },
  },
  methods: {
    trackScroll(visible, element, section) {
      if (this.gaCategory != undefined && visible) {
        this.$gtag.event('scroll', {
          'event_category': this.gaCategory,
          'event_label': section,
        })
      }
    },
  },
})
</script>
