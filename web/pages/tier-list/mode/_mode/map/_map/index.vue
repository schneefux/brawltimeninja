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
        :measurements="measurements"
        :measurement="measurement"
        :loading="$fetchState.pending"
        cube="map"
        @select="m => measurement = m"
      ></meta-slicers>
    </div>

    <meta-views
      v-if="totalSampleSize > 0"
      :entries="entries"
      :measurement="measurement"
      ga-category="map_meta"
      @view="v => loadAll = (v == 'legacy')"
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
      measurement: 'wins',
      totalSampleSize: 0,
      totalTimestamp: undefined as string|undefined,
      loadAll: false,
    }
  },
  watch: {
    slices: '$fetch',
    measurement: '$fetch',
    loadAll: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const measurements = !this.loadAll ? [measurementMap[this.measurement], 'picks', 'timestamp'] : [...this.measurements.map(m => measurementMap[m]), 'picks', 'timestamp']
    const data = await this.$clicker.query('meta.map', 'map',
      ['brawler_name'],
      measurements,
      {
        ...this.slices,
        battle_event_mode: [this.event.mode],
        battle_event_map: [this.event.map],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: !this.loadAll ? {
        [this.measurement]: row[measurementMap[this.measurement]]
          / (measurementOfTotal[this.measurement] ? data.totals[measurementMap[this.measurement]] : 1),
      } : {
        wins: row.wins,
        winRate: row.battle_victory,
        useRate: row.picks_weighted / data.totals.picks_weighted,
        pickRate: row.picks / data.totals.picks,
        starRate: row.battle_starplayer,
        rank1Rate: row.battle_rank1,
        duration: row.battle_duration,
      },
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
})
</script>
