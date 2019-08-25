<template>
  <div class="py-4 px-2">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Brawler Meta
      </h1>
      <p class="md:text-center">
        The statistics shown are from Battles by Players who visited Brawl Time Ninja in the current season.
        For this reason, the numbers shown can be contrary to your personal experience.
      </p>
      <p class="mt-2 mb-6 md:text-center">
        Showing average statistics for all maps. To view Win Rates for specific maps, load the
        <nuxt-link to="/meta/map" class="link inline-block">
          Map Meta
        </nuxt-link>.
      </p>

      <p
        v-if="totalSampleSize < 10000"
        class="my-8 text-center"
      >
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>

      <adsense
        v-if="ads"
        ins-class="h-24 mb-2 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9201379700"
      />

      <meta-grid
        :entries="brawlers"
        :ad-slots="adSlots"
        :ad-frequency="7"
        link-text="View Starpower stats"
        ga-category="brawler_meta"
      />

      <adsense
        v-if="ads && !isApp"
        ins-class="h-32 mt-4 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7838173054"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps } from '~/store/index'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'BrawlerMetaPage',
  components: {
    MetaGrid,
  },
  head() {
    const description = 'Brawl Stars Brawler Tier List. Find the best Brawlers. View Win Rates, Pick Rates and Rankings.'
    return {
      title: 'Brawler Meta',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      adSlots: ['5457575815', '2907434096', '3837372386', '6271964031', '9020582159', '9306580664'],
      metaStatMaps,
    }
  },
  computed: {
    totalSampleSize() {
      return this.meta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    brawlers() {
      return this.meta.map(brawler => ({
        id: brawler.id,
        brawler: brawler.id,
        title: brawler.name,
        stats: brawler.stats,
        link: `/meta/brawler/${brawler.id}`,
      }))
    },
    ...mapState({
      meta: state => state.brawlerMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadBrawlerMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadBrawlerMeta()
    }
  },
  methods: {
    ...mapActions({
      loadBrawlerMeta: 'loadBrawlerMeta',
    }),
  },
}
</script>
