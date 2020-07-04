<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Star Power Tier List</h1>
      <p>
        Use the Gadget Tier List to find the best Star Power for all Brawlers in Brawl Stars.
      </p>
      <p v-if="totalSampleSize < 10000">
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>
    </div>

    <div class="section">
      <meta-grid
        :entries="starpowers"
        link-text="More Statistics"
        ga-category="starpower_meta"
      />
    </div>
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
    trackScroll(visible, element, section) {
      if (visible && '$ga' in this) {
        this.$ga.event('starpower_meta', 'scroll', section)
      }
    },
    ...mapActions({
      loadStarpowerMeta: 'loadStarpowerMeta',
    }),
  },
}
</script>
