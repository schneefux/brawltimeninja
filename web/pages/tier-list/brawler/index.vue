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
          <mode-best-brawlers-card :mode="mode"></mode-best-brawlers-card>
        </div>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllModes"
          class="button button--md"
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
        cube="map"
      ></meta-slicers>
      <meta-grid
        :entries="brawlers"
        default-stat="winRate"
        ga-category="brawler_meta"
      ></meta-grid>
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
import { MetaGridEntry, brawlerId } from '../../../lib/util'

interface Row {
  brawler_name: string
  battle_event_mode: number
  picks: number
  picks_weighted: number
  battle_victory: number
  battle_duration: number
  battle_starplayer: number
  battle_rank1: number
}

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
      slices: {} as any,
      data: [] as Row[],
      totals: {} as Row,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.totals.picks
    },
    brawlers(): MetaGridEntry[] {
      return this.data.map(row => ({
        id: row.brawler_name,
        brawler: row.brawler_name,
        title: row.brawler_name,
        stats: {
          winRate: row.battle_victory,
          useRate: row.picks_weighted / this.totals.picks_weighted,
          pickRate: row.picks / this.totals.picks,
          starRate: row.battle_starplayer,
          rank1Rate: row.battle_rank1,
          duration: row.battle_duration,
        },
        sampleSize: row.picks,
        link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
      }) as MetaGridEntry)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices: '$fetch',
  },
  async fetch() {
    const data = await this.$clicker.query('map',
      ['brawler_name'],
      ['picks', 'picks_weighted', 'battle_victory', 'battle_duration', 'battle_starplayer', 'battle_rank1'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = data.data
    this.totals = data.totals
  },
  async asyncData({ $clicker }) {
    const modes = await $clicker.query('map',
      ['battle_event_mode'],
      ['battle_event_mode'],
      { trophy_season_end: ['balance'] },
      { cache: 60*60*24 })

    return {
      modes: modes.data.map(row => row.battle_event_mode),
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
