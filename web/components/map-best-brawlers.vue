<template>
  <div class="brawler-avatars">
    <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 55px"></div>
    <div
      v-for="brawler in data"
      :key="brawler.brawler_name"
      class="brawler-avatars__element w-1/5"
    >
      <nuxt-link
        :to="`/tier-list/brawler/${brawlerId({ name: brawler.brawler_name })}`"
        :router="$router"
        class="brawler-avatar"
      >
        <media-img
          :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
          size="160"
          clazz="brawler-avatar__img"
        ></media-img>
        <p class="brawler-avatar__stats">
          {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
          {{ metaStatMaps.labelsShort.winRate }}
        </p>
      </nuxt-link>
    </div>
    <p v-if="!$fetchState.pending && data.length == 0">
      No data.
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, metaStatMaps } from '~/lib/util'

interface Row {
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    limit: {
      type: Number,
      default: 5
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    this.data = []

    const data = await this.$clicker.query('meta.map.best', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('map'),
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
        ...(this.season != undefined ? {
          trophy_season_end: undefined,
          trophy_season_end_exact: [this.season],
        } : {}),
      },
      {
        sort: { battle_victory_adj: 'desc' },
        limit: this.limit,
        cache: 60*15,
      })
    this.data = data.data as any
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
