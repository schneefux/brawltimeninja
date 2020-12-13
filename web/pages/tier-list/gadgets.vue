<template>
  <page title="Gadget Tier List">
    <p>
      Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars. <br />
      The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
    </p>

    <meta-views
      :sample="totalSampleSize"
      :sample-min="300000"
      :timestamp="totalTimestamp"
      :entries="entries"
      :measurements="measurements"
      :slices="slices"
      :loading="$fetchState.pending"
      default-measurement="winsZScore"
      cube="gadget"
      @measurements="ms => selectedMeasurements = ms"
      @slices="s => slices = s"
    ></meta-views>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId, capitalizeWords, measurementMap, calculateDiffs } from '../../lib/util'

export default Vue.extend({
  data() {
    return {
      slices: this.$clicker.defaultSlices('gadget'),
      entries: [] as MetaGridEntry[],
      measurements: ['winsZScore', 'winRate', 'starRate', 'rank1Rate'],
      selectedMeasurements: ['winsZScore'],
      totalSampleSize: undefined as undefined|number,
      totalTimestamp: undefined as undefined|string,
    }
  },
  head() {
    const description = `Brawl Stars Gadget Tier List. Find the best Gadgets for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Gadgets',
  },
  middleware: ['cached'],
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

    const data = await this.$clicker.query('meta.gadget', 'gadget',
      ['brawler_id', 'brawler_name', 'brawler_gadget_id', 'brawler_gadget_name'],
      [...fetchingMeasurements, 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.entries = calculateDiffs(data.data, 'gadgets', 'brawler_gadget_name', 'brawler_gadget_id', calculateZScore)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
})
</script>
