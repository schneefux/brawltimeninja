<template>
  <page-section
    :title="'Tier List for ' + event.modeName + ' - ' + event.map"
    tracking-id="stats"
    tracking-page-id="map_meta"
  >
    <p slot="description">
      Explore exclusive Brawl Stars Brawler statistics.
    </p>

    <meta-views
      :sample="totalSampleSize"
      :sample-min="100000"
      :timestamp="totalTimestamp"
      :entries="entries"
      :measurements="measurements"
      :slices="slices"
      :description="description"
      :loading="$fetchState.pending"
      cube="map"
      @measurements="ms => selectedMeasurements = ms"
      @slices="s => slices = s"
    ></meta-views>
  </page-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { brawlerId, capitalizeWords, deslugify, kebabToCamel, measurementMap, measurementOfTotal, MetaGridEntry } from '~/lib/util'
import { Slices } from '~/plugins/clicker'

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
      link: [ {
        // do not differentiate by query strings (slices)
        rel: 'canonical',
        href: this.$route.path,
      } ],
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  props: {
    event: {
      type: Object as PropType<Map>,
      required: true
    },
  },
  data() {
    return {
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
    slices: {
      get(): Slices {
        return this.$clicker.routeToSlices(this.$route, this.$clicker.defaultSlices('map'))
      },
      set(slices: Slices) {
        this.$router.replace(this.$clicker.slicesToLocation(slices, this.$clicker.defaultSlices('map'))).catch(error => {
          if (error.name != 'NavigationDuplicated') {
            throw error
          }
        })
      }
    },
    measurements(): string[] {
      let measurements = ['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate']
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
  scrollToTop: true,
})
</script>
