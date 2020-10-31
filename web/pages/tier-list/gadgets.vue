<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Gadget Tier List</h1>
      <p>
        Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars. <br />
        The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
      </p>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="300000"
        :loading="$fetchState.pending"
        cube="gadget"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurements="measurements"
        ga-category="gadget_meta"
        @measurements="ms => selectedMeasurements = ms"
      ></meta-views>
    </div>
  </div>
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
      measurements: ['winRate', 'starRate', 'rank1Rate'],
      selectedMeasurements: ['winsZScore'],
      totalSampleSize: 0,
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
    const calculateZScore = this.selectedMeasurements[0] == 'winsZScore'
    const data = await this.$clicker.query('meta.gadget', 'gadget',
      ['brawler_id', 'brawler_name', 'brawler_gadget_id', 'brawler_gadget_name'],
      calculateZScore ? ['battle_victory', 'picks'] : this.selectedMeasurements.map(m => measurementMap[m]),
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.entries = calculateDiffs(data.data, 'brawler_gadget_name', 'brawler_gadget_id', calculateZScore)
    this.totalSampleSize = data.totals.picks
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('gadget_meta', 'scroll', section)
      }
    },
  },
})
</script>
