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
      <p>
        See also the
        <nuxt-link to="/tier-list/gadgets" class="link inline-block">
          Gadget Tier List
        </nuxt-link> or the
        <nuxt-link to="/tier-list/starpowers" class="link inline-block">
          Star Power Tier List
        </nuxt-link>.
      </p>
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
      <div class="overflow-x-auto scrolling-touch flex md:flex-wrap justify-center">
        <nuxt-link
          v-for="(mode, index) in modes"
          :key="mode"
          :to="`/tier-list/mode/${camelToKebab(mode)}`"
          :class="{ 'md:hidden': !showAllModes && index >= 3 }"
          class="px-2"
        >
          <event :mode="mode" actions>
            <template v-slot:content>
              <div class="brawler-avatars my-4">
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
            <template v-slot:actions>
              <div class="flex justify-end">
                <nuxt-link
                  :to="`/tier-list/mode/${camelToKebab(mode)}`"
                  class="button button-md"
                >
                  Open
                </nuxt-link>
              </div>
            </template>
          </event>
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
      link-text="More Statistics"
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
import { metaStatMaps, MetaGridEntry, camelToKebab, getMostPopular, formatMode, MetaGridEntrySorted } from '../../../lib/util'
import { MapMetaMap, MetaMapEntry, BrawlerMetaEntry, ModeMetaMap } from '../../../model/MetaEntry'

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
      brawlerMeta: [] as BrawlerMetaEntry[],
      modeMeta: {} as ModeMetaMap,
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
    const modeMeta = await $axios.$get('/api/meta/mode')
    const brawlerMeta = await $axios.$get('/api/meta/brawler')
    return {
      modeMeta,
      brawlerMeta,
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
