<template>
  <div>
    <div
      class="section"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2 text-center">Tier List for {{ event.modeName }} - {{ event.map }}</h2>
      <p class="mt-1 md:text-center">
        Explore exclusive Brawl Stars Brawler statistics.
      </p>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="100000"
        :timestamp="totalTimestamp"
        :loading="$fetchState.pending"
        cube="map"
      ></meta-slicers>
    </div>

    <meta-views
      v-if="totalSampleSize > 0"
      :entries="entries"
      :description="description"
      :measurements="measurements"
      ga-category="map_meta"
      @measurements="ms => selectedMeasurements = ms"
    ></meta-views>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { brawlerId, capitalizeWords, deslugify, kebabToCamel, measurementMap, measurementOfTotal, MetaGridEntry } from '~/lib/util'

interface Map {
  id: string
  mode: string
  modeName: string
  map: string
}

export default Vue.extend({
  head(): MetaInfo {
    const description = `Brawl Stars Tier List for ${this.event.modeName}: ${this.event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${this.event.modeName}: ${this.event.map}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  props: {
    event: {
      type: Object as PropType<Map>,
      required: true
    },
  },
  data() {
    return {
      slices: this.$clicker.defaultSlices('map'),
      entries: [] as MetaGridEntry[],
      selectedMeasurements: ['winRateAdj'],
      totalSampleSize: 0,
      totalTimestamp: undefined as string|undefined,
    }
  },
  watch: {
    slices: '$fetch',
    selectedMeasurements: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.map', 'map',
      ['brawler_name'],
      [...this.selectedMeasurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
      {
        ...this.slices,
        battle_event_mode: [this.event.mode],
        battle_event_map: [this.event.map],
      },
      { sort: { picks: 'desc' }, cache: 60*10 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: this.selectedMeasurements.reduce((stats, m) => ({
        ...stats,
        [m]: row[measurementMap[m]] / (measurementOfTotal[m] ? data.totals[measurementMap[m]] : 1),
      }), {} as Record<string, number>),
      sampleSize: row.picks,
      link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
    }) as MetaGridEntry)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
  computed: {
    measurements(): string[] {
      let measurements = ['wins', 'winRate', 'useRate', 'pickRate']
      // all 3v3: star player
      if (['gemGrab', 'heist', 'bounty', 'hotZone', 'brawlBall', 'siege'].includes(this.event.mode)) {
        measurements = [...measurements, 'starRate']
      }
      // all 3v3 except bounty: duration
      if (['gemGrab', 'heist', 'hotZone', 'brawlBall', 'siege'].includes(this.event.mode)) {
        measurements = [...measurements, 'duration']
      }
      if (this.event.mode.endsWith('howdown')) {
        measurements = [...measurements, 'rank1Rate']
      }
      return measurements
    },
    description(): string {
      const slices = {
        ...this.slices,
        battle_event_mode: [this.event.mode],
        battle_event_map: [this.event.map],
      }
      return this.$clicker.describeSlices(slices, this.totalTimestamp)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
  scrollToTop: true,
})
</script>
