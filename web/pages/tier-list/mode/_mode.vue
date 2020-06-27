<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ formatMode(mode) }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ formatMode(mode) }}</span> Tier List to find the best Brawler for all {{ formatMode(mode) }} maps in Brawl Stars.</p>
    </div>

    <adsense
      v-if="ads"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="2291234880"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'maps'),
        once: true,
      }"
    >
      <h2 class="page-h2">Map Tier Lists</h2>
      <p>Click on a Map to view the Tier List for it.</p>
    </div>

    <div class="section">
      <div class="overflow-x-auto scrolling-touch flex md:flex-wrap">
        <nuxt-link
          v-for="(map, index) in maps"
          :key="map"
          :to="`/tier-list/map/${map.id}`"
          :class="{ 'md:hidden': !showAllMaps && index >= 3 }"
          class="px-2"
        >
          <event :mode="map.mode" :map="map.map">
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
          v-show="!showAllMaps"
          class="button button-md"
          @click="showAllMaps = true; $ga.event('meta_mode', 'load_more')"
        >
          Show All {{ formatMode(mode) }} Maps
        </button>
      </div>
    </div>

    <adsense
      v-if="ads && !isApp"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="2263314723"
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
      <h2 class="page-h2">Tier List for all {{ formatMode(mode) }} Maps</h2>
      <p v-if="totalSampleSize < 10000">
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>
    </div>

    <div class="section">
      <meta-grid
        :entries="modes"
        ga-category="mode_meta"
      />
    </div>

    <adsense
      v-if="ads && !isApp"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="8497550588"
      data-ad-format="auto"
      data-full-width-responsive
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { formatMode, MetaGridEntry } from '../../../lib/util'
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
  name: 'ModeMetaPage',
  head() {
    const description = `Brawl Stars ${formatMode((<any>this).mode)} Tier List. Find the best Brawlers for ${formatMode((<any>this).mode)} with Win Rates and Rankings.`
    return {
      title: `${formatMode((<any>this).mode)} Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      formatMode,
      mode: '',
      showAllMaps: false,
    }
  },
  asyncData({ params }) {
    const mode = kebabToCamel(params.mode as string)
    return {
      mode,
    }
  },
  computed: {
    totalSampleSize(): number {
      return this.modes
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    modes(): MetaGridEntry[] {
      if (!(this.mode in this.modeMeta)) {
        return []
      }
      return [...Object.entries((<ModeMetaMap>this.modeMeta)[this.mode].brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: brawler.name,
          brawler: brawlerId,
          link: `/tier-list/brawler/${brawlerId}`,
          sampleSize: brawler.sampleSize,
          stats: brawler.stats,
        }))
    },
    maps(): MapMetaWithId[] {
      return [...Object.entries(<MapMetaMap>this.mapMeta)]
        .map(([id, event]) => ({ ...event, id }))
        .filter((event) => event.mode == this.mode)
    },
    ...mapState({
      modeMeta: (state: any) => state.modeMeta as ModeMetaMap,
      mapMeta: (state: any) => state.mapMeta as MapMetaMap,
      ads: (state: any) => state.adsEnabled as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async fetch({ store }) {
    if (!(<any>process).static) {
      await store.dispatch('loadModeMeta')
      await store.dispatch('loadMapMeta')
    }
  },
  async created() {
    if ((<any>process).static) {
      await this.loadModeMeta()
      await this.loadMapMeta()
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible && '$ga' in this) {
        this.$ga.event('mode_meta', 'scroll', section)
      }
    },
    ...mapActions({
      loadModeMeta: 'loadModeMeta',
      loadMapMeta: 'loadMapMeta',
    }),
  },
})
</script>
