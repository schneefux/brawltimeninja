<template>
  <card
    :title="brawler + ' with another Brawler'"
    :icon="'/brawlers/' + brawlerId({ name: brawler }) + '/avatar'"
    :size="size"
    :pages="Math.ceil(data.length / 10)"
  >
    <template v-slot:content="{ page }">
      <div class="brawler-avatars flex-wrap my-2">
        <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 87px"></div>
        <div
          v-for="brawler in data.slice(0, 5 + page * 10)"
          :key="brawler.brawler_name"
          class="brawler-avatars__element my-2"
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
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { metaStatMaps, brawlerId } from '../lib/util'

interface SynergyRow {
  ally_brawler_name: string
  battle_victory: number
  picks: number
}

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
    mode: {
      type: String,
      required: false
    },
    map: {
      type: String,
      required: false
    },
    id: {
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
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    // TODO use brawler_id

    /*
      Let A, B be Brawlers and H(x) the number of wins.
      How much better is P(A,B) than P(A)*P(B)?
      We know:
        P(A,B) = P(A) * P(B|A)
        P(A) = H(A) / H
        P(B|A) = H(B,A) / H(A)
      so:
        P(A,B) = H(B,A) * H(B) / H(A) / H
    */
    // TODO: Apply the above, fix the base rate fallacy present in this code

    const synergies = await this.$clicker.query<SynergyRow>('meta.synergy.widget', 'synergy',
      ['ally_brawler_name'],
      ['picks', 'battle_victory'],
      {
        ...this.$clicker.defaultSlices('synergy'),
        brawler_name: [this.brawler.toUpperCase()],
      },
      { cache: 60*60 })

    // get winrate(A) and winrate(B)
    const baselines = await this.$clicker.query<Row>('meta.synergy.widget.all', 'synergy',
        ['brawler_name'],
        ['picks', 'battle_victory'],
        this.$clicker.defaultSlices('synergy'),
        { cache: 60*60 })

    const baselineMap = baselines.data.reduce((map, row) => ({
      ...map,
      [row.brawler_name]: row.battle_victory,
    }), {} as Record<string, number>)

    const data = synergies.data.map((row) => (<Row>{
      brawler_name: row.ally_brawler_name,
      picks: row.picks,
      battle_victory: row.battle_victory - Math.sqrt(baselineMap[this.brawler.toUpperCase()] * baselineMap[row.ally_brawler_name]),
    }))

    data.sort((e1, e2) => e2.picks >= this.sampleSizeThreshold && e1.picks >= this.sampleSizeThreshold ? e2.battle_victory - e1.battle_victory : e2.picks - e1.picks)
    this.data = data
  },
})
</script>
