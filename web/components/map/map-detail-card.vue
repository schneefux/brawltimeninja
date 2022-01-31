<template>
  <event-card
    v-bind="$attrs"
    :mode="mode"
    :map="map"
    :link="localePath(linkTarget)"
    nobackground
  >
    <div
      slot="content"
      class="flex flex-wrap justify-evenly items-center"
    >
      <media-img
        v-if="id != undefined"
        :path="id != '0' ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
        size="512"
        clazz="h-64"
        wrapper-class="mt-4"
      ></media-img>

      <div class="mt-4">
        <b-card
          v-if="timestamp != undefined"
          :elevation="2"
        >
          <dl
            slot="content"
            class="flex justify-between"
          >
            <dt class="text-left font-semibold mr-1">
              {{ $t('tier-list.map.last-online', { time: '' }) }}
            </dt>
            <dd class="text-right ml-1">
              {{ lastOnlineString }}
            </dd>
          </dl>
        </b-card>

        <b-card :elevation="2">
          <map-balance-score
            slot="content"
            :slices="{ mode: [mode], map: [map], season: [season] }"
          ></map-balance-score>
        </b-card>

        <b-card
          title="Best Brawlers"
          :elevation="2"
        >
          <map-best-brawlers
            slot="content"
            :slices="{ mode: [mode], map: [map], season: [season] }"
            :elevation="3"
          ></map-best-brawlers>
        </b-card>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import { differenceInMinutes, formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { camelToKebab, slugify } from '~/lib/util'

import { enUS, de } from 'date-fns/locale'
const locales = { en: enUS, de: de }

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
    season: {
      type: String,
    },
    link: {
      type: Boolean,
      default: false
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
    linkTarget(): string {
      if (this.mode == undefined) {
        return '/tier-list/brawler'
      }

      if (this.map == undefined) {
        return `/tier-list/mode/${camelToKebab(this.mode)}`
      }

      return `/tier-list/mode/${camelToKebab(this.mode)}/map/${slugify(this.map)}`
    },
  },
})
</script>
