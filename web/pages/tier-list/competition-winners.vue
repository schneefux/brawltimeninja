<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">All Competition Winner Maps</h1>
    </div>

    <div class="section flex flex-wrap justify-center">
      <lazy
        v-for="(map, index) in maps"
        :key="map.mode + map.map"
        :render="index < 3"
        :class="{ 'md:hidden': !showAll && index >= 3 }"
      >
        <map-detail-card
          :map="map.map"
          :mode="map.mode"
          :timestamp="map.timestamp"
          link
        ></map-detail-card>
      </lazy>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { camelToKebab, slugify } from '~/lib/util'

interface Event {
  timestamp: string
  map: string
  mode: string
  link: string
}

export default Vue.extend({
  data() {
    return {
      maps: [] as Event[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.mode.competition', 'map',
      ['battle_event_map', 'battle_event_mode'],
      ['battle_event_map', 'battle_event_mode', 'timestamp', 'picks'], {
        ...this.$clicker.defaultSlices('map'),
        battle_event_map_like: ['Competition Winner %'],
      }, {
        cache: 60*30,
        sort: { timestamp: 'desc' },
      })

    this.maps = data.data
      // events overlap slightly and get misclassified... TODO fix this in backend
      .filter(row => row.picks > 1000)
      .map(row => ({
        timestamp: row.timestamp,
        map: row.battle_event_map,
        mode: row.battle_event_mode,
        link: `/tier-list/mode/${camelToKebab(row.battle_event_mode)}/map/${slugify(row.battle_event_map)}`,
      }))
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('competition_winners', 'scroll', section)
      }
    },
  },
})
</script>
