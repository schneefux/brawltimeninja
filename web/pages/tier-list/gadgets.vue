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
        The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
      </p>
    </div>

    <div class="section">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="300000"
        :measurements="measurements"
        :measurement="measurement"
        :loading="$fetchState.pending"
        cube="gadget"
        @select="m => measurement = m"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurement="measurement"
        ga-category="gadget_meta"
        @view="v => loadAll = (v == 'legacy')"
      ></meta-views>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry, brawlerId, capitalizeWords, measurementMap } from '../../lib/util'

interface Row {
  picks: number;
  brawler_id: string
  brawler_name: string
  brawler_gadget_id: number
  brawler_gadget_name: string
  battle_victory: number
  battle_starplayer: number
  battle_rank1: number
}

function calculateDiffs(rows: Row[]) {
  const statsToDiffs = (starpower: Row) => {
    const brawlerWithout = rows
      .find(b => b.brawler_gadget_name == '' && b.brawler_id == starpower.brawler_id)
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
    const brawlerWithout = rows
      .find(b => b.brawler_gadget_name == '' && b.brawler_id == starpower.brawler_id)
    if (brawlerWithout == undefined) {
      return 0
    }
    return Math.min(starpower.picks, brawlerWithout.picks)
  }

  return rows
    .filter(s => s.brawler_gadget_name !== '')
    .map((starpower) => (<MetaGridEntry>{
      id: `${starpower.brawler_id}-${starpower.brawler_gadget_name}`,
      title: capitalizeWords(starpower.brawler_gadget_name.toLowerCase()),
      brawler: starpower.brawler_name,
      sampleSize: sampleSize(starpower),
      stats: statsToDiffs(starpower),
      icon: `/gadgets/${starpower.brawler_gadget_id}`,
      link: `/tier-list/brawler/${brawlerId({ name: starpower.brawler_name })}`,
    }))
}

export default Vue.extend({
  data() {
    return {
      slices: this.$clicker.defaultSlices('gadget'),
      entries: [] as MetaGridEntry[],
      measurements: ['winRate', 'starRate', 'rank1Rate'],
      measurement: 'winRate',
      totalSampleSize: 0,
      loadAll: false,
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
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    slices() {
      this.$fetch()
    },
    measurement() {
      this.$fetch()
    },
    loadAll(l: boolean) {
      if (l) {
        this.$fetch()
      }
    },
  },
  async fetch() {
    const measurements = !this.loadAll ? [measurementMap[this.measurement], 'picks'] : [...this.measurements.map(m => measurementMap[m]), 'picks']
    const data = await this.$clicker.query('meta.gadget', 'gadget',
      ['brawler_id', 'brawler_name', 'brawler_gadget_id', 'brawler_gadget_name'],
      measurements,
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*60 })
    this.entries = calculateDiffs(data.data)
    this.totalSampleSize = data.totals.picks
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
