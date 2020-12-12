<template>
  <page title="Brawl Stars Brawler Tier List">
    <p>Brawler Tier Lists are generated automatically for all Brawlers in Brawl Stars.</p>

    <page-section
      title="Gadget and Star Power Tier List"
      tracking-id="gadgets"
      tracking-page-id="brawler_meta"
    >
      <div class="flex flex-wrap justify-center">
        <best-starpowers-card
          kind="starpowers"
        ></best-starpowers-card>

        <best-starpowers-card
          kind="gadgets"
        ></best-starpowers-card>
      </div>
    </page-section>

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
      title="State of the Meta"
      tracking-id="widget"
      tracking-page-id="brawler_meta"
    >
      <p slot="description">
        Curious about the past?
        <b-button
          to="/tier-list/history"
          primary
          xs
          prefetch
        >Open the Time Capsule</b-button>
      </p>

      <map-detail-card
        class="mx-auto"
      ></map-detail-card>
    </page-section>

    <page-section
      title="Tier List for all Maps and Modes"
      tracking-id="widget"
      tracking-page-id="brawler_meta"
    >
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="100000"
        :timestamp="totalTimestamp"
        :loading="$fetchState.pending"
        cube="map"
        class="mx-auto"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurements="['winRate', 'wins', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']"
        :description="description"
        ga-category="brawler_meta"
        @measurements="ms => selectedMeasurements = ms"
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
