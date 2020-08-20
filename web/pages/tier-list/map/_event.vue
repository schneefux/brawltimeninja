<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ formatMode(event.mode) }}: {{ event.map }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ event.map }}</span> Tier List to find the best Brawler for this {{ formatMode(event.mode) }} map in Brawl Stars.</p>
    </div>

    <adsense
      ins-class="ad-section"
      id="ezoic-pub-ad-placeholder-112"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="1665534416"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div
      v-if="best.length"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <event
        :mode="event.mode"
        :map="event.map"
        infobar
      >
        <template v-slot:infobar>
          <media-img
            :path="'/maps/' + event.id"
            size="384"
            clazz="h-48 mx-auto"
            itemprop="image"
          ></media-img>
        </template>
        <template v-slot:content>
          <div class="brawler-avatars my-4">
            <div
              v-for="brawler in best.slice(0, 5)"
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
      <h2 class="page-h2">Tier List for {{ formatMode(event.mode) }} - {{ event.map }}</h2>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <p v-if="mapMeta.sampleSize < 10000">
      ⚠ Not enough data for this event yet!
      <template v-if="brawlers.length < totalBrawlers">
        Some statistics are unavailable.
      </template>
      <template v-else>
        Statistics will be inaccurate.
      </template>
      Play a few battles and come back later. ⚠
    </p>

    <div class="section">
      <meta-grid
        :entries="brawlers"
        ga-category="map_meta"
      />
    </div>

    <adsense
      ins-class="ad-section"
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
import { formatMode, metaStatMaps, camelToKebab, getMostPopular, MetaGridEntry, MetaGridEntrySorted, getBest } from '../../../lib/util'
import { MapMetaMap, MapMeta, Map } from '../../../model/MetaEntry'

export default Vue.extend({
  name: 'MapMetaPage',
  head() {
    const description = `Brawl Stars Tier List for ${formatMode((<any>this).event.mode as string)}: ${(<any>this).event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${formatMode((<any>this).event.mode as string)}: ${(<any>this).event.map}`,
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
      event: {
        id: '',
        mode: '',
        map: '',
      },
      mapMeta: {} as MapMeta,
      best: [] as MetaGridEntrySorted[],
      trophyRange: [0, 10],
    }
  },
  computed: {
    brawlers(): MetaGridEntry[] {
      return Object.entries(this.mapMeta.brawlers).map(([brawlerId, brawler]) => ({
        id: brawlerId,
        brawler: brawlerId,
        title: (<any>brawler).name,
        stats: (<any>brawler).stats,
        sampleSize: (<any>brawler).sampleSize,
        link: `/tier-list/brawler/${brawlerId}`,
      }))
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    async trophyRange([lower, upper]) {
      const mapMeta = await this.$axios.$get(`/api/meta/map/mode/${this.event.mode}?trophyrange=${lower}-${upper}`)
      const bestByEvent = getBest(mapMeta)
      this.mapMeta = mapMeta[this.event.id]
      this.best = bestByEvent[this.event.id]
    },
  },
  async asyncData({ store, params, error, $axios }) {
    const events = await $axios.$get('/api/events')
    if (!(params.event in events)) {
      return error({ statusCode: 404, message: 'Event not found' })
    }
    const event = events[params.event] as Map
    const mapMeta = await $axios.$get('/api/meta/map/mode/' + event.mode)
    const bestByEvent = getBest(mapMeta)
    return {
      mapMeta: mapMeta[params.event],
      best: bestByEvent[params.event],
      event: {
        ...event,
        id: params.event,
      },
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
})
</script>
