<template>
  <div class="py-4 px-2">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        Map Meta
      </h1>
      <h2 class="text-2xl md:text-center mt-3 font-semibold capitalize">
        {{ formatMode(selectedMode) }}: {{ selectedMap }}
      </h2>
      <div class="flex justify-center mt-5">
        <event-card :event="selectedEvent" />
      </div>
      <p class="mt-6 md:text-center">
        The statistics shown are from Battles by Players who visited Brawl Time Ninja in the current season.
        For this reason, the numbers shown can be contrary to your personal experience.
      </p>
      <p class="mt-2 mb-6 md:text-center">
        Showing statistics for
        <span class="text-primary-lighter inline-block">
          {{ formatMode(selectedMode) }} - {{ selectedMap }}
        </span>.
        To view average Win Rates for all maps, load the
        <nuxt-link to="/meta/brawler" class="link inline-block">
          Brawler Meta
        </nuxt-link>.
      </p>

      <p
        v-if="meta.sampleSize < 1000"
        class="mt-5 mb-8 text-center text-xl font-bold"
      >
        ⚠ Not enough data for this event yet!
        <template v-if="sortedBrawlers.length == 0">
          Statistics are unavailable.
        </template>
        <template v-else>
          Statistics will be inaccurate.
        </template>
        Play a few battles and come back later. ⚠
      </p>

      <adsense
        v-if="ads"
        ins-class="h-24 mb-2 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
      />

      <meta-grid
        :entries="brawlers"
        :ad-slots="adSlots"
        :ad-frequency="7"
        ga-category="map_meta"
      />

      <adsense
        v-if="ads"
        ins-class="h-32 mt-4 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatMode, metaStatMaps } from '~/store/index'
import EventCard from '~/components/event-card.vue'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'MapMetaPage',
  components: {
    EventCard,
    MetaGrid,
  },
  head() {
    const description = `Best Brawlers for ${formatMode(this.selectedMode)}: ${this.selectedMap}. View a Tier List with Win Rates, Pick Rates and Rankings.`
    return {
      title: `Win Rates for ${formatMode(this.selectedMode)}: ${this.selectedMap}`,
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
      const meta = [...Object.entries(this.meta.brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: brawlerId,
          brawler: brawlerId,
          stats: brawler.stats,
        }))
      if (meta.length < this.totalBrawlers) {
        return []
      }

      return meta
    },
    ...mapState({
      totalBrawlers: state => state.totalBrawlers,
      mapMeta: state => state.mapMeta,
      ads: state => state.adsEnabled,
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
