<template>
  <div class="py-4 px-2">
    <div class="py-8 px-6 my-8 relative">
      <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
        {{ formatMode(mode) }} Tier List
      </h1>
      <p class="md:text-center max-w-lg mx-auto">
        Use the <span class="text-primary-lighter">{{ formatMode(mode) }}</span> Tier List to find the best Brawler for all {{ formatMode(mode) }} maps.
        The data is from Brawl Stars battles in the current season.
      </p>

      <p class="mt-2 mb-6 md:text-center">
        Showing global Tier List. To view Tier Lists for specific maps, load the
        <nuxt-link to="/tier-list/map" class="link inline-block">
          Map Tier Lists
        </nuxt-link>.
      </p>

      <p
        v-if="totalSampleSize < 10000"
        class="my-8 text-center"
      >
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>

      <meta-grid
        :entries="modes"
        :adSlots="[]"
        ga-category="mode_meta"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { formatMode } from '~/store/index'
import MetaGrid from '~/components/meta-grid.vue'

const kebabToCamel = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  })
}

export default {
  name: 'BrawlerMetaPage',
  components: {
    MetaGrid,
  },
  head() {
    const description = `Brawl Stars ${formatMode(this.mode)} Tier List. Find the best Brawlers for ${formatMode(this.mode)} with Win Rates and Rankings.`
    return {
      title: `${formatMode(this.mode)} Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      formatMode,
    }
  },
  asyncData({ params }) {
    const mode = kebabToCamel(params.mode)
    return {
      mode,
    }
  },
  computed: {
    totalSampleSize() {
      return this.modes
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    modes() {
      return [...Object.entries(this.modeMeta[this.mode].brawlers)]
        .map(([brawlerId, brawler]) => ({
          id: brawlerId,
          title: brawler.name,
          brawler: brawlerId,
          link: `/tier-list/brawler/${brawler.id}`,
          sampleSize: brawler.sampleSize,
          stats: brawler.stats,
        }))
    },
    ...mapState({
      modeMeta: state => state.modeMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
