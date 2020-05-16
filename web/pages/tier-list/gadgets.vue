<template>
  <div class="py-4 px-6">
    <h1 class="text-4xl md:text-center mt-2 mb-6 font-semibold">
      Gadget Tier List
    </h1>

    <p class="mt-2 mb-6 md:text-center">
      Showing Gadget Tier List for all Brawlers.
      To view other Brawler Tier Lists, load the
      <nuxt-link to="/tier-list/brawler" class="link inline-block">
        Brawler Tier List
      </nuxt-link> or the
      <nuxt-link to="/tier-list/starpowers" class="link inline-block">
        Star Power Tier List
      </nuxt-link>.
    </p>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
    </p>

    <meta-grid
      :entries="gadgets"
      :adSlots="[]"
      ga-category="gadget_meta"
      link-text="More Statistics"
    />

    <p class="md:text-center mt-4 mb-2 max-w-lg mx-auto">
      Use the Gadget Tier List to find the best Gadgets.
      The data is from Brawl Stars battles in the current season.
    </p>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import MetaGrid from '~/components/meta-grid.vue'

export default {
  name: 'GadgetMetaPage',
  components: {
    MetaGrid,
  },
  head() {
    const description = `Brawl Stars Gadget Tier List. Find the best Gadgets for all Brawlers with Win Rates and Rankings.`
    return {
      title: `Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  computed: {
    totalSampleSize() {
      return this.gadgets
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    gadgets() {
      return this.gadgetMeta
        .filter(g => g.gadgetName !== '')
        .map((gadget) => ({
          id: gadget.id,
          title: gadget.gadgetName,
          brawler: gadget.brawlerName,
          sampleSize: gadget.sampleSize,
          stats: gadget.stats,
          icon: `/gadgets/${gadget.id}`,
          link: `/tier-list/brawler/${gadget.brawlerName}`,
        }))
    },
    ...mapState({
      gadgetMeta: state => state.gadgetMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadGadgetMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadGadgetMeta()
    }
  },
  methods: {
    ...mapActions({
      loadGadgetMeta: 'loadGadgetMeta',
    }),
  },
}
</script>
