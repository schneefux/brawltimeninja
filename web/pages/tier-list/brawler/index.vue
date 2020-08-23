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
        :top-starpowers="topStarpowers"
        kind="starpowers"
      ></best-starpowers-card>

      <best-starpowers-card
        :top-starpowers="topGadgets"
        kind="gadgets"
      ></best-starpowers-card>
    </div>

    <adsense
      id="ezoic-pub-ad-placeholder-107"
      ins-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="9201379700"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <h2 class="page-h2">Mode Tier Lists</h2>
      <p>Click on a Mode to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex md:flex-wrap md:justify-center">
        <nuxt-link
          v-for="(mode, index) in modes"
          :key="mode"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
          :class="{ 'md:hidden': !showAllModes && index >= 3 }"
          class="px-2"
        >
          <mode-best-brawlers-card
            :mode="mode"
            :top-brawlers="topBrawlersByMode[mode]"
          >
          </mode-best-brawlers-card>
        </nuxt-link>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllModes"
          class="button button-md"
          @click="showAllModes = true; $ga.event('brawler_meta', 'load_more')"
        >
          Show All Modes
        </button>
      </div>
    </div>

    <adsense
      v-if="!isApp"
      ins-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="6446102315"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for all Modes</h2>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
    </p>

    <meta-grid
      :entries="brawlers"
      ga-category="brawler_meta"
    />

    <adsense
      v-if="!isApp"
      ins-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="7838173054"
      data-ad-format="auto"
      data-full-width-responsive
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { metaStatMaps, MetaGridEntry, camelToKebab, getMostPopular, formatMode, MetaGridEntrySorted, getBestBrawlersByEachMetric } from '../../../lib/util'
import { BrawlerMetaStatistics, StarpowerMetaStatistics, GadgetMetaStatistics } from '../../../model/Api'
import { ModeMetaMap } from '../../../model/MetaEntry'

export default Vue.extend({
  name: 'BrawlerMetaPage',
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
      metaStatMaps,
      camelToKebab,
      formatMode,
      brawlerMeta: [] as BrawlerMetaStatistics[],
      modeMeta: {} as ModeMetaMap,
      starpowerMeta: [] as StarpowerMetaStatistics[],
      gadgetMeta: [] as GadgetMetaStatistics[],
      trophyRange: [0, 10],
      showAllModes: false,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.brawlerMeta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    modes(): string[] {
      return [...Object.keys(this.modeMeta)]
        .sort((mode1, mode2) => this.modeMeta[mode2].sampleSize - this.modeMeta[mode1].sampleSize)
    },
    topBrawlersByMode(): { [key: string]: MetaGridEntrySorted[] } {
      return getMostPopular(this.modeMeta)
    },
    brawlers(): MetaGridEntry[] {
      return this.brawlerMeta.map(brawler => ({
        id: brawler.id,
        brawler: brawler.id,
        title: brawler.name,
        stats: brawler.stats,
        sampleSize: brawler.sampleSize,
        link: `/tier-list/brawler/${brawler.id}`,
      }))
    },
    topStarpowers(): { [stat: string]: BrawlerMetaStatistics } {
      const starpowers = this.starpowerMeta
        .filter(s => s.starpowerName !== '')
        .map(s => ({
          id: s.id,
          name: s.starpowerName,
          sampleSize: s.sampleSize,
          stats: s.stats,
        }))
      return getBestBrawlersByEachMetric(starpowers)
    },
    topGadgets(): { [stat: string]: BrawlerMetaStatistics } {
      const gadgets = this.gadgetMeta
        .filter(s => s.gadgetName !== '')
        .map(s => ({
          id: s.id,
          name: s.gadgetName,
          sampleSize: s.sampleSize,
          stats: s.stats,
        }))
      return getBestBrawlersByEachMetric(gadgets)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    async trophyRange([lower, upper]) {
      this.brawlerMeta = await this.$axios.$get(`/api/meta/brawler?trophyrange=${lower}-${upper}`)
    },
  },
  async asyncData({ $axios }) {
    const modeMeta = await $axios.$get('/api/meta/mode') as ModeMetaMap
    const brawlerMeta = await $axios.$get('/api/meta/brawler') as BrawlerMetaStatistics[]
    const starpowerMeta = await $axios.$get(`/api/meta/starpower`) as StarpowerMetaStatistics[]
    const gadgetMeta = await $axios.$get(`/api/meta/gadget`) as GadgetMetaStatistics[]
    return {
      modeMeta,
      brawlerMeta,
      starpowerMeta,
      gadgetMeta,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('brawler_meta', 'scroll', section)
      }
    },
  },
})
</script>
