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
          <mode-best-brawlers-card
            :mode="mode"
            :top-brawlers="topBrawlersByMode[mode]"
          >
          </mode-best-brawlers-card>
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
      <p>
        Using over {{ formatSI(totalSampleSize) }} battles.
        <template v-if="totalSampleSize < 10000">
          ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
        </template>
      </p>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <meta-grid
      :entries="brawlers"
      ga-category="brawler_meta"
    />

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
import { MetaGridEntry, camelToKebab, formatSI, getMostPopular, MetaGridEntrySorted, getBestBrawlersByEachMetric } from '../../../lib/util'
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
      camelToKebab,
      formatSI,
      brawlerMeta: [] as BrawlerMetaStatistics[],
      modes: [] as string[],
      topBrawlersByMode: {} as { [key: string]: MetaGridEntrySorted[] },
      topGadgets: {} as { [stat: string]: BrawlerMetaStatistics },
      topStarpowers: {} as { [stat: string]: BrawlerMetaStatistics },
      trophyRange: [0, 10],
      showAllModes: false,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.brawlerMeta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
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
    const brawlerMeta = await $axios.$get<BrawlerMetaStatistics[]>('/api/meta/brawler')
    const modeMeta = await $axios.$get<ModeMetaMap>('/api/meta/mode').catch(() => ({}))
    const starpowerMeta = await $axios.$get<StarpowerMetaStatistics[]>(`/api/meta/starpower`).catch(() => [])
    const gadgetMeta = await $axios.$get<GadgetMetaStatistics[]>(`/api/meta/gadget`).catch(() => [])

    const modes = [...Object.keys(modeMeta)]
      .sort((mode1, mode2) => modeMeta[mode2].sampleSize - modeMeta[mode1].sampleSize)
    const topBrawlersByMode = getMostPopular(modeMeta)

    const gadgets = gadgetMeta
      .filter(s => s.gadgetName !== '')
      .map(s => ({
        id: s.id,
        name: s.gadgetName,
        sampleSize: s.sampleSize,
        stats: s.stats,
      }))
    const topGadgets = getBestBrawlersByEachMetric(gadgets)

    const starpowers = starpowerMeta
      .filter(s => s.starpowerName !== '')
      .map(s => ({
        id: s.id,
        name: s.starpowerName,
        sampleSize: s.sampleSize,
        stats: s.stats,
      }))
    const topStarpowers = getBestBrawlersByEachMetric(starpowers)

    return {
      modes,
      topBrawlersByMode,
      modeMeta,
      brawlerMeta,
      topStarpowers,
      topGadgets,
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
