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
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="300000"
      ></meta-slicers>
      <meta-grid
        :entries="starpowers"
        :sample-size-threshold="1000"
        default-stat="winRate"
        ga-category="starpower_meta"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId } from '../../lib/util'

interface Row {
  brawler_id: number
  brawler_name: string
  brawler_starpower_id: number
  brawler_starpower_name: string
  picks: number
  battle_victory: number
  battle_starplayer: number
  battle_rank1: number
}

export default Vue.extend({
  data() {
    return {
      slices: {
        brawler_trophyrange: [0, 10],
        trophy_season_end: ['balance'],
      },
      data: [] as Row[],
      totals: {} as Row,
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
      return this.totals.picks
    },
    starpowers(): MetaGridEntry[] {
      const statsToDiffs = (starpower: Row) => {
        const brawlerWithout = this.data
          .find(b => b.brawler_starpower_name == '' && b.brawler_id == starpower.brawler_id)
        const perc = (v) => Math.round(v * 100 * 100) / 100
        const signed = (v) => v > 0 ? `+${v}%` : `${v}%`
        const format = (v) => signed(perc(v))

        if (brawlerWithout == undefined) {
          return {
            winRate: starpower.battle_victory,
            starRate: starpower.battle_starplayer,
            rank1Rate: starpower.battle_rank1,
          }
        }

        return {
          winRate: format(starpower.battle_victory - brawlerWithout.battle_victory),
          starRate: format(starpower.battle_starplayer - brawlerWithout.battle_starplayer),
          rank1Rate: format(starpower.battle_rank1 - brawlerWithout.battle_rank1),
        }
      }
      const sampleSize = (starpower: Row) => {
        const brawlerWithout = this.data
          .find(b => b.brawler_starpower_name == '' && b.brawler_id == starpower.brawler_id)
        if (brawlerWithout == undefined) {
          return 0
        }
        return Math.min(starpower.picks, brawlerWithout.picks)
      }

      return this.data
        .filter(s => s.brawler_starpower_name !== '')
        .map((starpower) => ({
          id: `${starpower.brawler_id}-${starpower.brawler_starpower_name}`,
          title: starpower.brawler_starpower_name,
          brawler: starpower.brawler_name,
          sampleSize: sampleSize(starpower),
          stats: statsToDiffs(starpower),
          icon: `/starpowers/${starpower.brawler_starpower_id}`,
          link: `/tier-list/brawler/${brawlerId({ name: starpower.brawler_name })}`,
        }))
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices: '$fetch',
  },
  async fetch() {
    const data = await this.$clicker.query('starpower',
      ['brawler_id', 'brawler_name', 'brawler_starpower_id', 'brawler_starpower_name'],
      ['battle_victory', 'battle_starplayer', 'battle_rank1', 'picks'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.data = data.data
    this.totals = data.totals
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
