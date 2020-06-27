<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ formatMode(selectedMode) }}: {{ selectedMap }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ selectedMap }}</span> Tier List to find the best Brawler for this {{ formatMode(selectedMode) }} map in Brawl Stars.</p>
      <p v-if="meta.sampleSize < 1000">
        ⚠ Not enough data for this event yet!
        <template v-if="brawlers.length < totalBrawlers">
          Some statistics are unavailable.
        </template>
        <template v-else>
          Statistics will be inaccurate.
        </template>
        Play a few battles and come back later. ⚠
      </p>
    </div>

    <adsense
      v-if="ads"
      root-class="ad-section"
      id="ezoic-pub-ad-placeholder-112"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="1665534416"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      v-if="bestByEvent[selectedEvent.id].length"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <event
        :mode="selectedEvent.mode"
        :map="selectedEvent.map"
        infobar
      >
        <template v-slot:infobar>
          <media-img
            :path="'/maps/' + selectedEvent.id"
            size="384"
            clazz="h-48 mx-auto"
            itemprop="image"
          ></media-img>
        </template>
        <template v-slot:content>
          <div class="brawler-avatars my-4">
            <div
              v-for="brawler in bestByEvent[selectedEvent.id].slice(0, 5)"
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
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for {{ formatMode(selectedMode) }} - {{ selectedMap }}</h2>
    </div>

    <div class="section">
      <meta-grid
        :entries="brawlers"
        ga-category="map_meta"
      />
    </div>

    <adsense
      v-if="ads"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="3536131238"
      data-ad-format="auto"
      data-full-width-responsive
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { formatMode, metaStatMaps, camelToKebab, getMostPopular, MetaGridEntry, MetaGridEntrySorted } from '../../../lib/util'
import { MapMetaMap, MapMeta } from '../../../model/MetaEntry'

export default Vue.extend({
  name: 'MapMetaPage',
  head() {
    const description = `Brawl Stars Tier List for ${formatMode(this.selectedMode as string)}: ${this.selectedMap}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${formatMode(this.selectedMode as string)}: ${this.selectedMap}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      formatMode,
      metaStatMaps,
      camelToKebab,
      selectedEvent: {
        id: '',
        mode: '',
        map: '',
      },
    }
  },
  computed: {
    selectedMode(): string {
      return this.selectedEvent.mode
    },
    selectedMap(): string {
      return this.selectedEvent.map
    },
    meta(): MapMeta {
      return this.mapMeta[this.selectedEvent.id]
    },
    brawlers(): MetaGridEntry[] {
      return [...Object.entries(this.meta.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: (<any>brawler).name,
          brawler: brawlerId,
          sampleSize: (<any>brawler).sampleSize,
          stats: (<any>brawler).stats,
        }))
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
      bestByEvent: (state: any) => state.bestByEvent as { [key: string]: MetaGridEntrySorted[] },
      mapMeta: (state: any) => state.mapMeta as MapMetaMap,
      ads: (state: any) => state.adsEnabled as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async validate({ store, params }) {
    await store.dispatch('loadMapMetaSlice', `include=${params.event}`)
    return params.event in store.state.mapMeta
  },
  asyncData({ store, params }) {
    const meta = store.state.mapMeta[params.event]
    return {
      selectedEvent: {
        id: params.event as string,
        mode: meta.mode as string,
        map: meta.map as string,
      },
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible && '$ga' in this) {
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
})
</script>
