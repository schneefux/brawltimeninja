<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ modeName }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ modeName }}</span> Tier List to find the best Brawler for all {{ modeName }} maps in Brawl Stars.</p>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2291234880"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'maps'),
        once: true,
      }"
    >
      <h2 class="page-h2">Map Tier Lists</h2>
      <p>Open on a Map to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
        <div
          v-for="(map, index) in maps"
          :key="map.id"
          :class="{ 'md:hidden': !showAllMaps && index >= 3 }"
          class="px-2"
        >
          <event-card
            :mode="map.mode"
            :map="map.map"
          >
            <template v-slot:content>
              <div class="flex justify-center bg-black">
                <media-img
                  :path="`/maps/${map.id}`"
                  size="384"
                  clazz="h-48"
                ></media-img>
              </div>
              <div class="absolute bottom-0 right-0 mb-4 mr-2">
                <nuxt-link
                  :to="`/tier-list/map/${map.id}`"
                  class="button button--md"
                >
                  Open
                </nuxt-link>
              </div>
            </template>
          </event-card>
        </div>
      </div>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllMaps"
          class="button button--md"
          @click="showAllMaps = true; $ga.event('meta_mode', 'load_more')"
        >
          Show All {{ modeName }} Maps
        </button>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2263314723"
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
      <h2 class="page-h2">Tier List for all {{ modeName }} Maps</h2>
      <p>
        Using {{ formatSI(totalSampleSize) }} battles.
        <template v-if="totalSampleSize < 10000">
          ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
        </template>
      </p>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <div class="section">
      <meta-grid
        :entries="modes"
        ga-category="mode_meta"
      />
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8497550588"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, MetaGridEntry, formatSI } from '../../../lib/util'
import { MapMetaMap, ModeMetaMap, MapMeta } from '../../../model/MetaEntry'

const kebabToCamel = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  })
}

interface MapMetaWithId extends MapMeta {
  id: string
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars ${(<any>this).modeName} Tier List. Find the best Brawlers for ${(<any>this).modeName} with Win Rates and Rankings.`
    return {
      title: `${(<any>this).modeName} Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      showAllMaps: false,
      trophyRange: [0, 10],
      mode: '',
      modeName: '',
      modeMeta: {} as ModeMetaMap,
      mapMeta: {} as MapMetaMap,
      formatSI,
    }
  },
  watch: {
    async trophyRange([lower, upper]) {
      this.modeMeta = await this.$axios.$get(`/api/meta/mode?trophyrange=${lower}-${upper}`) as ModeMetaMap
    },
  },
  async asyncData({ params, $axios }) {
    const mode = kebabToCamel(params.mode as string)
    const modeName = formatMode(mode)
    const modeMeta = await $axios.$get<ModeMetaMap>('/api/meta/mode')
    const mapMeta = await $axios.$get<MapMetaMap>('/api/meta/map/mode/' + mode.toLowerCase())

    return {
      mode,
      modeName,
      modeMeta,
      mapMeta,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.modes
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    modes(): MetaGridEntry[] {
      const brawlers = this.mode in this.modeMeta ? Object.entries(this.modeMeta[this.mode].brawlers) : []
      return brawlers.map(([brawlerId, brawler]) => ({
        id: brawlerId,
        brawler: brawlerId,
        title: brawler.name,
        stats: brawler.stats,
        sampleSize: brawler.sampleSize,
        link: `/tier-list/brawler/${brawlerId}`,
      }) as MetaGridEntry)
    },
    maps(): MapMetaWithId[] {
      return [...Object.entries(<MapMetaMap>this.mapMeta)]
        .map(([id, event]) => ({ ...event, id }))
        .filter((event) => event.mode == this.mode)
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('mode_meta', 'scroll', section)
      }
    },
  },
})
</script>
