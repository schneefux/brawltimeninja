<template>
  <card
    :title="brawler + ' on your team'"
    :icon="'/brawlers/' + brawlerId({ name: brawler }) + '/avatar'"
    :size="size"
  >
    <div slot="content" class="brawler-avatars overflow-x-auto scrolling-touch">
      <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 87px"></div>
      <div
        v-for="brawler in data"
        :key="brawler.brawler_name"
        class="flex-shrink-0 brawler-avatars__element my-4"
      >
        <nuxt-link
          :to="`/tier-list/brawler/${brawlerId({ name: brawler.brawler_name })}`"
          :router="$router"
          class="brawler-avatar"
        >
          <media-img
            :path="`/brawlers/${brawlerId({ name: brawler.brawler_name })}/avatar`"
            size="160"
            clazz="brawler-avatar__img"
          ></media-img>
          <p class="brawler-avatar__stats">
            <template v-if="brawler.picks >= sampleSizeThreshold">
              {{ brawler.battle_victory > 0 ? '+' : '' }}{{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
              {{ metaStatMaps.labelsShort.winRate }}
            </template>
            <template v-else>
              ?
            </template>
          </p>
        </nuxt-link>
      </div>
    </div>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { metaStatMaps, brawlerId } from '../lib/util'

interface Row {
  brawler_name: string
  battle_victory: number
  picks: number
}

export default Vue.extend({
  props: {
    brawler: {
      type: String,
      required: true
    },
    sampleSizeThreshold: {
      type: Number,
      default: 1000
    },
    size: {
      type: String,
      required: false
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
  async fetch() {
    // TODO use brawler_id

    // how much better is the actual winrate(AxB) than
    // Naive Bayes sqrt(winrate(A)*winrate(B))?
    // get winrate(AxB)
    const synergies = await this.$clicker.query('meta.synergy.widget', 'synergy',
      ['brawler_name'],
      ['picks', 'battle_victory'],
      {
        trophy_season_end: ['balance'],
        ally_brawler_name: [this.brawler.toUpperCase()],
      },
      { cache: 60*60 }) as any

    // get winrate(A) and winrate(B)
    const baselines = await this.$clicker.query('meta.synergy.widget.all', 'synergy',
        ['brawler_name'],
        ['picks', 'battle_victory'],
        {
          trophy_season_end: ['balance'],
        },
        { cache: 60*60 }) as any

    const baselineMap = baselines.data.reduce((map, row) => ({
      ...map,
      [row.brawler_name]: row.battle_victory,
    }), {} as any)

    const data = synergies.data.map((row) => ({
      brawler_name: row.brawler_name,
      picks: row.picks,
      battle_victory: row.battle_victory - Math.sqrt(baselineMap[this.brawler.toUpperCase()] * baselineMap[row.brawler_name]),
    }))

    data.sort((e1, e2) => e2.picks >= this.sampleSizeThreshold && e1.picks >= this.sampleSizeThreshold ? e2.battle_victory - e1.battle_victory : e2.picks - e1.picks)
    this.data = data
  },
})
</script>
