<template>
  <event-card
    :mode="this.mode"
    :map="this.map"
  >
    <media-img
      slot="infobar"
      :path="'/maps/' + this.id"
      size="384"
      clazz="h-48 mx-auto"
      itemprop="image"
    ></media-img>

    <div slot="content" class="brawler-avatars my-4">
      <div
        v-for="brawler in data"
        :key="brawler.brawler_name"
        class="brawler-avatars__element"
      >
        <div class="brawler-avatar">
          <media-img
            :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
            size="160"
            clazz="brawler-avatar__img"
          ></media-img>
          <p class="brawler-avatar__stats">
            {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
            &nbsp;
            {{ metaStatMaps.labelsShort.winRate }}
          </p>
        </div>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { metaStatMaps, brawlerId } from '../lib/util'

interface Row {
  brawler_name: string
  battle_victory: number
}

export default Vue.extend({
  props: {
    id: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
  async fetch() {
    const data = await this.$clicker.query('map',
      ['brawler_name'],
      ['battle_victory'],
      {
        trophy_season_end: ['balance'],
        battle_event_map: [this.map],
        battle_event_mode: [this.mode],
      },
      {
        sort: { battle_victory: 'desc' },
        limit: 5,
        cache: 60*60,
      })
    this.data = data.data as any
  },
})
</script>
