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
      <p>
        Use the Gadget Tier List to find the best Gadget for all Brawlers in Brawl Stars. <br />
        The statistics are calculated as the difference between a Brawler with a Gadget and a Brawler without a Gadget.
      </p>
      <p v-if="totalSampleSize < 10000">
        ⚠ Not enough data for this yet! Statistics will be inaccurate. Play a few battles and come back later. ⚠
      </p>
    </div>

    <div class="section text-center mb-2">
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <div class="section">
      <meta-grid
        :entries="gadgets"
        :sample-size-threshold="1000"
        ga-category="gadget_meta"
        link-text="More Statistics"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { GadgetMetaStatistics } from '../../model/Api'
import { MetaGridEntry } from '../../lib/util'

export default Vue.extend({
  name: 'GadgetMetaPage',
  data() {
    return {
      gadgetMeta: [] as GadgetMetaStatistics[],
      trophyRange: [0, 10],
    }
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
    totalSampleSize(): number {
      return this.gadgets
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    gadgets(): MetaGridEntry[] {
      const statsToDiffs = (gadget) => {
        const brawlerWithout = this.gadgetMeta
          .find(b => b.gadgetName == '' && b.brawlerId == gadget.brawlerId)
        if (brawlerWithout == undefined) {
          return {}
        }

        const perc = (v) => Math.round(v * 100 * 100) / 100
        const signed = (v) => v > 0 ? `+${v}%` : `${v}%`
        const format = (v) => signed(perc(v))

        const stats = {}
        Object.entries(gadget.stats)
          .forEach(([prop, value]) => stats[prop] = format(<number>value - brawlerWithout.stats[prop]))
        return stats
      }
      const sampleSize = (gadget) => {
        const brawlerWithout = this.gadgetMeta
          .find(b => b.gadgetName == '' && b.brawlerId == gadget.brawlerId)
        if (brawlerWithout == undefined) {
          return 0
        }
        return Math.min(gadget.sampleSize, brawlerWithout.sampleSize)
      }

      return this.gadgetMeta
        .filter(g => g.gadgetName !== '')
        .map((gadget) => ({
          id: gadget.id,
          title: gadget.gadgetName,
          brawler: gadget.brawlerName,
          sampleSize: sampleSize(gadget),
          stats: statsToDiffs(gadget),
          icon: `/gadgets/${gadget.id}`,
          link: `/tier-list/brawler/${gadget.brawlerName}`,
        }))
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    async trophyRange([lower, upper]) {
      this.gadgetMeta = await this.$axios.$get(`/api/meta/gadget?trophyrange=${lower}-${upper}`) as GadgetMetaStatistics[]
    },
  },
  async asyncData({ $axios }) {
    const gadgetMeta = await $axios.$get('/api/meta/gadget') as GadgetMetaStatistics[]
    return {
      gadgetMeta,
    }
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('gadget_meta', 'scroll', section)
      }
    },
  },
})
</script>
