<template>
  <card
    :title="brawler + ' with another Brawler'"
    :icon="'/brawlers/' + brawlerId({ name: brawler }) + '/avatar'"
    :pages="Math.ceil(data.length / 10)"
    size="w-80"
  >
    <template v-slot:content="{ page }">
      <p>
        {{ description }}
      </p>
      <div class="brawler-avatars flex-wrap my-2">
        <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 87px"></div>
        <div
          v-for="brawler in data.slice(0, 5 + page * 20)"
          :key="brawler.brawler_name"
          class="brawler-avatars__element w-1/5 my-2"
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
import { PicksWins } from '~/plugins/clicker'
import { metaStatMaps, brawlerId, capitalizeWords, formatList } from '../lib/util'

interface Row {
  brawler_name: string
  picks: number
  battle_victory: number
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
    description(): string {
      if (this.data.length < 5) {
        return ''
      }
      const formatName = (r: Row) => capitalizeWords(r.brawler_name.toLowerCase())
      const topText = formatList(this.data.slice(0, 4).map(formatName))
      const bottomText = formatList(this.data.slice(-3).map(formatName))
      return `${this.brawler} performs best together with ${topText}. Playing with ${bottomText} puts ${this.brawler} at disadvantage.`
    },
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    /*
      Calculate the difference between
      assumed independence: P(brawler,ally) = P(brawler) * P(ally) = H(brawler) * H(ally) / H^2
      and observation:      P(brawler,ally) = H(brawler,ally) / H
    */

    const slices = this.$clicker.defaultSlices('synergy')

    const bayesStats = await this.$clicker.calculateBayesSynergies(slices, 'meta.synergy.widget', this.brawler)

    const data: Row[] = []
    const brawler = this.brawler.toUpperCase()
    bayesStats.pairData.get(brawler)!.forEach((picksWins, allyBrawler) => {
      if (brawler == allyBrawler) {
        return
      }

      const hBrawler = bayesStats.data.get(brawler)!
      const hAlly = bayesStats.data.get(allyBrawler)!
      const hBrawlerAlly = picksWins
      const h = bayesStats.totals
      const h2: PicksWins = {
        wins: bayesStats.totals.wins * bayesStats.totals.wins,
        picks: bayesStats.totals.picks * bayesStats.totals.picks,
      }

      const assumption: PicksWins = {
        picks: hBrawler.picks * hAlly.picks / h2.picks,
        wins: hBrawler.wins * hAlly.wins / h2.wins,
      }
      const observation: PicksWins = {
        picks: hBrawlerAlly.picks / h.picks,
        wins: hBrawlerAlly.wins / h.wins,
      }

      data.push({
        brawler_name: allyBrawler,
        picks: bayesStats.sampleSize,
        battle_victory: observation.wins / observation.picks - assumption.wins / assumption.picks,
      })
    })

    data.sort((e1, e2) => e2.picks >= this.sampleSizeThreshold && e1.picks >= this.sampleSizeThreshold ? e2.battle_victory - e1.battle_victory : e2.picks - e1.picks)
    this.data = data
  },
})
</script>
