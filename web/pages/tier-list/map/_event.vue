<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ event.modeName }}: {{ event.map }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ event.map }}</span> Tier List to find the best Brawler for this {{ event.modeName }} map in Brawl Stars.</p>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        id="ezoic-pub-ad-placeholder-112"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      v-if="best.length"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <map-best-brawlers-card
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :top-brawlers="best"
        infobar
      >
      </map-best-brawlers-card>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'stats'),
        once: true,
      }"
    >
      <h2 class="page-h2">Tier List for {{ event.modeName }} - {{ event.map }}</h2>
      <p>
        Using over {{ formatSI(event.sampleSize) }} battles.
        <template v-if="mapMeta.sampleSize < 10000">
          ⚠ Not enough data for this event yet!
          <template v-if="brawlers.length < totalBrawlers">
            Some statistics are unavailable.
          </template>
          <template v-else>
            Statistics will be inaccurate.
          </template>
          Play a few battles and come back later. ⚠
        </template>
      </p>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <div class="section">
      <meta-grid
        :entries="brawlers"
        ga-category="map_meta"
      />
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatMode, formatSI, MetaGridEntry, MetaGridEntrySorted, getBest } from '../../../lib/util'
import { MapMetaMap, MapMap, MapMeta, Map } from '../../../model/MetaEntry'

interface MapWithId extends Map {
  id: string
  modeName: string
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars Tier List for ${(<any>this).event.modeName}: ${(<any>this).event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${(<any>this).event.modeName}: ${(<any>this).event.map}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      event: {
        id: '',
        mode: '',
        modeName: '',
        map: '',
      } as MapWithId,
      mapMeta: {} as MapMeta,
      best: [] as MetaGridEntrySorted[],
      trophyRange: [0, 10],
      formatSI,
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
      const mapMeta = await this.$axios.$get(`/api/meta/map/mode/${this.event.mode}?trophyrange=${lower}-${upper}`) as MapMetaMap
      const bestByEvent = getBest(mapMeta)
      this.mapMeta = mapMeta[this.event.id]
      this.best = bestByEvent[this.event.id]
    },
  },
  async asyncData({ store, params, error, $axios }) {
    const events = await $axios.$get<MapMap>('/api/events')
    if (!(params.event in events)) {
      return error({ statusCode: 404, message: 'Event not found' })
    }
    const event = events[params.event]
    const mapMeta = await $axios.$get<MapMetaMap>('/api/meta/map/mode/' + event.mode)
    const bestByEvent = getBest(mapMeta)
    return {
      mapMeta: mapMeta[params.event],
      best: bestByEvent[params.event],
      event: {
        ...event,
        id: params.event,
        modeName: formatMode(event.mode),
      } as MapWithId,
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
