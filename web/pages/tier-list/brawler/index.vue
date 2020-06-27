<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1 class="text-4xl md:text-center font-semibold">
        Brawler Tier List
      </h1>
    </div>
    <p class="mt-2 mb-6 md:text-center">
      Showing global Tier List. To view specific Tier Lists, load the
      <nuxt-link to="/tier-list/map" class="link inline-block">
        Map Tier Lists
      </nuxt-link>.
      See also the
      <nuxt-link to="/tier-list/gadgets" class="link inline-block">
        Gadget Tier List
      </nuxt-link> or the
      <nuxt-link to="/tier-list/starpowers" class="link inline-block">
        Star Power Tier List
      </nuxt-link>.
    </p>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">Mode Tier Lists</h2>
      <p>Click on a Mode to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex">
        <nuxt-link
          v-for="(mode, index) in modes"
          :key="mode"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
          :class="{ 'md:hidden': !showAllModes && index >= 3 }"
          class="px-2"
        >
          <event :mode="mode">
            <template v-slot:content>
              <div class="brawler-avatars mt-3 mb-2">
                <div
                  v-for="brawler in topBrawlersByMode[mode].slice(0, 5)"
                  :key="brawler.id"
                  class="brawler-avatars__element"
                >
                  <div class="brawler-avatar">
                    <media-img
                      :path="`/brawlers/${brawler.id}/avatar`"
                      size="160"
                      clazz="brawler-avatar__img"
                    />
                    <p class="brawler-avatar__stats">
                      {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
                      {{ metaStatMaps.labelsShort[brawler.sortProp] }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </event>
        </nuxt-link>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          class="button button-md"
          @click="showAllModes = true; $ga.event('battlelog', 'load_more', battlePage)"
        >
          Show All Modes
        </button>
      </div>
    </div>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">All Brawlers Tier List</h2>
    </div>
    <p class="section text-center mb-2">
      <label>
        Trophy Range:
        <select
          v-model="selectedRange"
          class="bg-primary hover:bg-primary-light rounded py-1 px-2 ml-2"
        >
          <option value="all" selected>All</option>
          <option value="1">Low (0-300)</option>
          <option value="2">Mid (300-600)</option>
          <option value="3">High (600+)</option>
        </select>
      </label>
    </p>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
    </p>

    <adsense
      v-if="ads"
      id="ezoic-pub-ad-placeholder-107"
      ins-class="h-24 mb-2 text-center"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="9201379700"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <meta-grid
      :entries="brawlers"
      link-text="More Statistics"
      ga-category="brawler_meta"
    />

    <p class="md:text-center">
      This Brawler Tier List is generated automatically for all Brawlers in Brawl Stars.
      The data is from Brawl Stars battles in the current season.
      Click on a link to view the best Star Powers for each Brawler.
    </p>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { metaStatMaps, MetaGridEntry, camelToKebab, getMostPopular, formatMode, MetaGridEntrySorted } from '../../../lib/util'
import { MapMetaMap, MetaMapEntry, BrawlerMetaEntry } from '../../../model/MetaEntry'

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
      rangeMeta: [] as BrawlerMetaEntry[],
      selectedRange: 'all',
      showAllModes: false,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.meta
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
      return this.meta.map(brawler => ({
        id: brawler.id,
        brawler: brawler.id,
        title: brawler.name,
        stats: brawler.stats,
        sampleSize: brawler.sampleSize,
        link: `/tier-list/brawler/${brawler.id}`,
      }))
    },
    meta(): BrawlerMetaEntry[] {
      return this.selectedRange == 'all' ? this.allBrawlerMeta : this.rangeMeta
    },
    ...mapState({
      modeMeta: (state: any) => state.modeMeta as MapMetaMap,
      allBrawlerMeta: (state: any) => state.brawlerMeta as BrawlerMetaEntry[],
      ads: (state: any) => state.adsEnabled as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    async selectedRange(trophyrangeId) {
      if (trophyrangeId == 'all') {
        return
      }
      this.rangeMeta = await this.$axios.$get('/api/meta/brawler?trophyrangeId=' + trophyrangeId)
    },
  },
  async fetch({ store }) {
    if (!(<any>process).static) {
      await store.dispatch('loadBrawlerMeta')
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if ((<any>process).static) {
      await this.loadBrawlerMeta()
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadBrawlerMeta: 'loadBrawlerMeta',
      loadModeMeta: 'loadModeMeta',
    }),
  },
})
</script>
