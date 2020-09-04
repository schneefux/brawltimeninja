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
        Use the Star Power Tier List to find the best Star Power for all Brawlers in Brawl Stars. <br />
        The statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
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
        :entries="starpowers"
        :sample-size-threshold="1000"
        ga-category="starpower_meta"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry } from '../../lib/util'
import { StarpowerMetaStatistics } from '../../model/Api'

export default Vue.extend({
  name: 'StarpowerMetaPage',
  data() {
    return {
      starpowerMeta: [] as StarpowerMetaStatistics[],
      trophyRange: [0, 10],
    }
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
    totalSampleSize(): number {
      return this.starpowers
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    starpowers(): MetaGridEntry[] {
      const statsToDiffs = (starpower) => {
        const brawlerWithout = this.starpowerMeta
          .find(b => b.starpowerName == '' && b.brawlerId == starpower.brawlerId)
        if (brawlerWithout == undefined) {
          return {}
        }

        const perc = (v) => Math.round(v * 100 * 100) / 100
        const signed = (v) => v > 0 ? `+${v}%` : `${v}%`
        const format = (v) => signed(perc(v))

        const stats = {}
        Object.entries(starpower.stats)
          .forEach(([prop, value]) => stats[prop] = format(<number>value - brawlerWithout.stats[prop]))
        return stats
      }
      const sampleSize = (starpower) => {
        const brawlerWithout = this.starpowerMeta
          .find(b => b.starpowerName == '' && b.brawlerId == starpower.brawlerId)
        if (brawlerWithout == undefined) {
          return 0
        }
        return Math.min(starpower.sampleSize, brawlerWithout.sampleSize)
      }

      return this.starpowerMeta
        .filter(s => s.starpowerName !== '')
        .map((starpower) => ({
          id: starpower.id,
          title: starpower.starpowerName,
          brawler: starpower.brawlerName,
          sampleSize: sampleSize(starpower),
          stats: statsToDiffs(starpower),
          icon: `/starpowers/${starpower.id}`,
          link: `/tier-list/brawler/${starpower.brawlerName}`,
        }))
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    async trophyRange([lower, upper]) {
      this.starpowerMeta = await this.$axios.$get(`/api/meta/starpower?trophyrange=${lower}-${upper}`) as StarpowerMetaStatistics[]
    },
  },
  async asyncData({ $axios }) {
    const starpowerMeta = await $axios.$get<StarpowerMetaStatistics[]>('/api/meta/starpower')
    return {
      starpowerMeta,
    }
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('starpower_meta', 'scroll', section)
      }
    },
  },
})
</script>
