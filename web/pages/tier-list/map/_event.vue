<template>
  <div class="py-4 px-6">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        Map Tier List
      </h1>
      <h2 class="text-2xl md:text-center mt-3 font-semibold capitalize">
        {{ formatMode(selectedMode) }}: {{ selectedMap }}
      </h2>
      <div class="flex justify-center mt-5">
        <event-card :event="selectedEvent" />
      </div>
      <p class="mt-6 md:text-center max-w-lg mx-auto">
        Use the <span class="text-primary-lighter">{{ selectedMap }}</span> Tier List to find the best Brawler for this {{ formatMode(selectedMode) }} map.
        The data is from Brawl Stars battles in the current season.
      </p>
      <p class="mt-2 mb-6 md:text-center">
        Showing statistics for battles played in
        <span class="text-primary-lighter inline-block">
          {{ formatMode(selectedMode) }} - {{ selectedMap }}
        </span>.
        To view an overall Tier List, load the
        <nuxt-link to="/tier-list/brawler" class="link inline-block">
          Brawler Tier List
        </nuxt-link>,
        or load the
        <nuxt-link :to="`/tier-list/mode/${camelToKebab(selectedMode)}`" class="link">
          {{ formatMode(selectedMode) }} Tier List
        </nuxt-link>.
      </p>

      <p
        v-if="meta.sampleSize < 1000"
        class="mt-5 mb-8 text-center text-xl font-bold"
      >
        ⚠ Not enough data for this event yet!
        <template v-if="brawlers.length < totalBrawlers">
          Some statistics are unavailable.
        </template>
        <template v-else>
          Statistics will be inaccurate.
        </template>
        Play a few battles and come back later. ⚠
      </p>

      <adsense
        v-if="ads"
        id="ezoic-pub-ad-placeholder-112"
        ins-class="h-24 mb-2 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
        data-ad-format="auto"
      />

      <meta-grid
        :entries="brawlers"
        :ad-slots="adSlots"
        :ad-frequency="13"
        ga-category="map_meta"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatMode, metaStatMaps, camelToKebab } from '~/lib/util'
import EventCard from '~/components/event-card.vue'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'MapMetaPage',
  components: {
    EventCard,
    MetaGrid,
  },
  head() {
    const description = `Brawl Stars Tier List for ${formatMode(this.selectedMode)}: ${this.selectedMap}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${formatMode(this.selectedMode)}: ${this.selectedMap}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      adSlots: ['3154710057', '6902383379', '8405314532', '7640749978', '1075341622', '5745639405'],
      formatMode,
      metaStatMaps,
      camelToKebab,
    }
  },
  computed: {
    selectedMode() {
      return this.selectedEvent.mode
    },
    selectedMap() {
      return this.selectedEvent.map
    },
    meta() {
      return this.mapMeta[this.selectedEvent.id]
    },
    brawlers() {
      return [...Object.entries(this.meta.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: brawler.name,
          brawler: brawlerId,
          sampleSize: brawler.sampleSize,
          stats: brawler.stats,
        }))
    },
    ...mapState({
      totalBrawlers: state => state.totalBrawlers,
      mapMeta: state => state.mapMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
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
        id: params.event,
        mode: meta.mode,
        map: meta.map,
      }
    }
  },
}
</script>
