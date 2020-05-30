<template>
  <div class="py-4 px-6">
    <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
      Star Power Tier List
    </h1>

    <p class="mt-2 mb-6 md:text-center">
      Showing Star Power Tier List for all Brawlers.
      To view other Brawler Tier Lists, load the
      <nuxt-link to="/tier-list/brawler" class="link inline-block">
        Brawler Tier List
      </nuxt-link> or the
      <nuxt-link to="/tier-list/gadgets" class="link inline-block">
        Gadget Tier List
      </nuxt-link>.
    </p>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
    </p>

    <meta-grid
      :entries="starpowers"
      :adSlots="[]"
      link-text="More Statistics"
      ga-category="starpower_meta"
    />

    <p class="md:text-center mt-4 mb-2 max-w-lg mx-auto">
      Use the Star Power Tier List to find the best Star Power.
      The data is from Brawl Stars battles in the current season.
    </p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'StarpowerMetaPage',
  components: {
    MetaGrid,
  },
  head() {
    const description = `Brawl Stars Star Power Tier List. Find the best Star Power for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Star Power Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  computed: {
    totalSampleSize() {
      return this.starpowers
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    starpowers() {
      const statsToDiffs = (starpower) => {
        const brawlerWithout = this.starpowerMeta
          .find(b => b.starpowerName == '' && b.brawlerId == starpower.brawlerId)

        const perc = (v) => Math.round(v * 100)
        const signed = (v) => v > 0 ? `+${v}%` : `${v}%`
        const format = (v) => signed(perc(v))

        const stats = {}
        Object.entries(starpower.stats)
          .forEach(([prop, value]) => stats[prop] = format(value - brawlerWithout.stats[prop]))
        return stats
      }

      return this.starpowerMeta
        .filter(s => s.starpowerName !== '')
        .map((starpower) => ({
          id: starpower.id,
          title: starpower.starpowerName,
          brawler: starpower.brawlerName,
          sampleSize: starpower.sampleSize,
          stats: statsToDiffs(starpower),
          icon: `/starpowers/${starpower.id}`,
          link: `/tier-list/brawler/${starpower.brawlerName}`,
        }))
    },
    ...mapState({
      starpowerMeta: state => state.starpowerMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadStarpowerMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadStarpowerMeta()
    }
  },
  methods: {
    ...mapActions({
      loadStarpowerMeta: 'loadStarpowerMeta',
    }),
  },
}
</script>
