<template>
  <page-dashboard title="Star Power Tier List">
    <p>
      Use the Star Power Tier List to find the best Star Power for all Brawlers in Brawl Stars. <br />
      The statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
    </p>

    <meta-views
      :sample="totalSampleSize"
      :sample-min="300000"
      :timestamp="totalTimestamp"
      :entries="entries"
      :measurements="measurements"
      :slices="slices"
      :loading="$fetchState.pending"
      class="mt-4"
      default-measurement="winsZScore"
      cube="starpower"
      @measurements="ms => selectedMeasurements = ms"
      @slices="s => slices = s"
    ></meta-views>
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import pageDashboard from '~/components/page-dashboard.vue'
import { MetaGridEntry, brawlerId, measurementMap, capitalizeWords, calculateDiffs } from '../../lib/util'

export default Vue.extend({
  components: { pageDashboard },
  data() {
    return {
      slices: this.$clicker.defaultSlices('starpower'),
      entries: [] as MetaGridEntry[],
      measurements: ['winsZScore', 'winRate', 'starRate', 'rank1Rate'],
      selectedMeasurements: ['winsZScore'],
      totalSampleSize: 0,
      totalTimestamp: '1970-01-01',
    }
  },
  middleware: ['cached'],
  head() {
    const description = `Brawl Stars Star Power Tier List. Find the best Star Power for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Star Power Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Star Powers',
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices: '$fetch',
    selectedMeasurements: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const calculateZScore = this.selectedMeasurements.includes('winsZScore')
    const fetchingMeasurements = this.selectedMeasurements
      .map(m => m == 'winsZScore' ? 'winRate' : m)
      .map(m => measurementMap[m])

    const data = await this.$clicker.query('meta.starpower', 'starpower',
      ['brawler_id', 'brawler_name', 'brawler_starpower_id', 'brawler_starpower_name'],
      [...fetchingMeasurements, 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.entries = calculateDiffs(data.data, 'starpowers', 'brawler_starpower_name', 'brawler_starpower_id', calculateZScore)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
})
</script>
