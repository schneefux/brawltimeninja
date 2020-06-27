<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Gadget Tier List</h1>
      <p>Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars.</p>
      <p v-if="totalSampleSize < 10000">
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>
    </div>

    <div class="section">
      <meta-grid
        :entries="gadgets"
        ga-category="gadget_meta"
        link-text="More Statistics"
      />
    </div>
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
      const statsToDiffs = (gadget) => {
        const brawlerWithout = this.gadgetMeta
          .find(b => b.gadgetName == '' && b.brawlerId == gadget.brawlerId)

        const perc = (v) => Math.round(v * 100)
        const signed = (v) => v > 0 ? `+${v}%` : `${v}%`
        const format = (v) => signed(perc(v))

        const stats = {}
        Object.entries(gadget.stats)
          .forEach(([prop, value]) => stats[prop] = format(value - brawlerWithout.stats[prop]))
        return stats
      }

      return this.gadgetMeta
        .filter(g => g.gadgetName !== '')
        .map((gadget) => ({
          id: gadget.id,
          title: gadget.gadgetName,
          brawler: gadget.brawlerName,
          sampleSize: gadget.sampleSize,
          stats: statsToDiffs(gadget),
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
    trackScroll(visible, element, section) {
      if (visible && '$ga' in this) {
        this.$ga.event('gadget_meta', 'scroll', section)
      }
    },
    ...mapActions({
      loadGadgetMeta: 'loadGadgetMeta',
    }),
  },
}
</script>
