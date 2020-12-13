<template>
  <page title="Brawl Stars Brawler Tier List">
    <p>Brawler Tier Lists are generated automatically for all Brawlers in Brawl Stars.</p>

    <div class="flex flex-wrap justify-center">
      <div
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gadgets'),
          once: true,
        }"
      >
        <best-starpowers-card
          kind="starpowers"
        ></best-starpowers-card>

        <best-starpowers-card
          kind="gadgets"
        ></best-starpowers-card>
      </div>

      <map-detail-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'widget'),
          once: true,
        }"
        title="State of the Brawl Stars Meta"
      >
        <b-button
          slot="actions"
          to="/tier-list/history"
          primary
          prefetch
        >Open Time Capsule</b-button>
      </map-detail-card>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6446102315"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section
      title="Tier List for all Maps and Modes"
      tracking-id="widget"
      tracking-page-id="brawler_meta"
    >
      <meta-views
        :sample="totalSampleSize"
        :sample-min="100000"
        :timestamp="totalTimestamp"
        :entries="entries"
        :measurements="['winRateAdj', 'winRate', 'wins', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']"
        :slices="slices"
        :description="description"
        :loading="$fetchState.pending"
        cube="map"
        @measurements="ms => selectedMeasurements = ms"
        @slices="s => slices = s"
      ></meta-views>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId, capitalize, capitalizeWords, measurementMap, measurementOfTotal } from '../../../lib/util'

export default Vue.extend({
  head() {
    const description = 'Brawl Stars Brawler Tier List. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'Brawler Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Brawlers',
  },
  middleware: ['cached'],
  data() {
    return {
      slices: this.$clicker.defaultSlices('map'),
      entries: [] as MetaGridEntry[],
      selectedMeasurements: ['winRateAdj'],
      totalSampleSize: 0,
      totalTimestamp: undefined as undefined|string,
    }
  },
  computed: {
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.totalTimestamp)
    },
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
    const data = await this.$clicker.query('meta.brawler', 'map',
      ['brawler_name'],
      [...this.selectedMeasurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })

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
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'brawler_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
