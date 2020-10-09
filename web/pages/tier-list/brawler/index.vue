<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Brawl Stars Brawler Tier List</h1>
      <p>Brawler Tier Lists are generated automatically for all Brawlers in Brawl Stars.</p>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gadgets'),
        once: true,
      }"
    >
      <h2 class="page-h2">Gadget and Star Power Tier List</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <best-starpowers-card
        kind="starpowers"
      ></best-starpowers-card>

      <best-starpowers-card
        kind="gadgets"
      ></best-starpowers-card>
    </div>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-107"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9201379700"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <h2 class="page-h2">Mode Tier Lists</h2>
      <p>Open a Mode to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex md:flex-wrap md:justify-center">
        <div
          v-for="(mode, index) in modes"
          :key="mode"
          :class="{ 'md:hidden': !showAllModes && index >= 3 }"
          class="px-2"
        >
          <map-best-brawlers-card
            :mode="mode"
            link
          ></map-best-brawlers-card>
        </div>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllModes"
          class="button button--md button--secondary"
          @click="showAllModes = true; $ga.event('brawler_meta', 'load_more')"
        >
          Show All Modes
        </button>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6446102315"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for all Maps and Modes</h2>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="100000"
        :measurements="['winRate', 'useRate', 'pickRate', 'starRate', 'rank1Rate', 'duration']"
        :measurement="measurement"
        :loading="$fetchState.pending"
        cube="map"
        @select="(m) => measurement = m"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurement="measurement"
        @view="v => loadAll = (v == 'legacy')"
        ga-category="brawler_meta"
      ></meta-views>
    </div>


    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId, capitalize, capitalizeWords, measurementMap, measurementOfTotal } from '../../../lib/util'

export default Vue.extend({
  head() {
    const description = 'Brawl Stars Brawler Tier List. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'All Brawlers Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      modes: [] as string[],
      showAllModes: false,
      slices: this.$clicker.defaultSlices('map'),
      entries: [] as MetaGridEntry[],
      measurement: 'wins',
      totalSampleSize: 0,
      loadAll: false,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices: '$fetch',
    measurement: '$fetch',
    loadAll: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const measurements = !this.loadAll ? [measurementMap[this.measurement], 'picks'] : ['wins', 'picks', 'picks_weighted', 'battle_victory', 'battle_duration', 'battle_starplayer', 'battle_rank1']
    const data = await this.$clicker.query('meta.brawler', 'map',
      ['brawler_name'],
      measurements,
      this.slices,
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
  },
  async asyncData({ $clicker }) {
    const modes = await $clicker.queryAllModes()

    return {
      modes,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$ga.event('brawler_meta', 'scroll', section)
      }
    },
  },
})
</script>
