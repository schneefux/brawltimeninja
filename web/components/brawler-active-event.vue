<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
  >
    <p v-if="end != undefined" slot="infobar" class="text-right">
      ends in {{ timeTillEnd }}
    </p>

    <div slot="content" class="my-2 flex">
      <div class="flex justify-center bg-gray-800 rounded mx-auto">
        <div class="flex flex-col justify-end mr-2">
          <media-img
            :path="`/brawlers/${brawlerId}/avatar`"
            :alt="brawlerName"
            size="128"
            clazz="w-16"
          ></media-img>
        </div>
        <dl
          v-if="data.picks > 1000"
          class="w-48 px-3 py-2"
        >
          <div class="flex justify-between">
            <dt>Use Rate</dt>
            <dd>{{ metaStatMaps.formatters.useRate(useRate) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Win Rate</dt>
            <dd>{{ metaStatMaps.formatters.winRate(data.battle_victory) }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>Above Average</dt>
            <dd>{{ data.battle_victory * useRate > 0.55 * 1.0/totalBrawlers ? 'Yes' : 'No' }}</dd>
          </div>
        </dl>
        <p v-else class="m-auto">No data yet.</p>
      </div>
    </div>

    <div slot="actions" class="flex justify-end">
      <nuxt-link
        :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map)}`"
        class="card__action"
      >
        Open
      </nuxt-link>
    </div>
  </event-card>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { mapState } from 'vuex'
import { brawlerId, camelToKebab, metaStatMaps, slugify } from '../lib/util'

interface Row {
  wins: number
  picks: number
  picks_weighted: number
  battle_victory: number
}

interface TotalsRow {
  picks_weighted: number
}

export default Vue.extend({
  props: {
    mode: {
      // camel case
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    id: {
      type: [String, Number],
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    end: {
      type: String,
    },
  },
  data() {
    return {
      data: {} as Row,
      totals: {} as TotalsRow,
      sampleSize: 0,
    }
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const data = await this.$clicker.query('meta.map.brawler-event', 'map',
      [],
      ['battle_victory', 'picks', 'picks_weighted', 'wins'],
      {
        ...this.$clicker.defaultSlices('map'),
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { cache: 60*30 })

    this.data = data.data[0]

    const totals = await this.$clicker.query('meta.map.brawler-event', 'map',
      [],
      ['picks_weighted'],
      {
        ...this.$clicker.defaultSlices('map'),
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
      },
      { cache: 60*30 })

    this.totals = totals.data[0]
  },
  computed: {
    useRate(): number {
      return this.data.picks_weighted / this.totals.picks_weighted
    },
    timeTillEnd(): string {
      if (this.end == undefined) {
        return ''
      }
      return formatDistanceToNow(parseISO(this.end))
    },
    brawlerId(): string {
      return brawlerId({ name: this.brawlerName })
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
