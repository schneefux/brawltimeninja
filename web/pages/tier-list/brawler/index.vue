<template>
  <div class="py-4 px-2">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        Brawler Tier List
      </h1>
      <p class="mt-2 mb-6 md:text-center">
        Showing global Tier List. To view specific Tier Lists, load the
        <nuxt-link to="/tier-list/map" class="link inline-block">
          Map Tier Lists
        </nuxt-link> or the
        <nuxt-link to="/tier-list/mode" class="link inline-block">
          Mode Tier Lists
        </nuxt-link>.
      </p>

      <p class="text-center">
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
      />

      <meta-grid
        :entries="brawlers"
        :ad-slots="adSlots"
        :ad-frequency="13"
        link-text="View Starpower stats"
        ga-category="brawler_meta"
      />

      <p class="md:text-center">
        This Brawler Tier List is generated automatically for all Brawlers in Brawl Stars.
        The data is from Brawl Stars battles in the current season.
        Click on a link to view the best Star Powers for each Brawler.
      </p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps } from '~/lib/util'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'BrawlerMetaPage',
  components: {
    MetaGrid,
  },
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
      adSlots: ['5457575815', '2907434096', '3837372386', '6271964031', '9020582159', '9306580664'],
      metaStatMaps,
      rangeMeta: [],
      selectedRange: 'all',
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
        link: `/tier-list/brawler/${brawler.id}`,
      }))
    },
    meta() {
      return this.selectedRange == 'all' ? this.allBrawlerMeta : this.rangeMeta
    },
    ...mapState({
      allBrawlerMeta: state => state.brawlerMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
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
