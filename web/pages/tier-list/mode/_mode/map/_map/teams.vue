<template>
  <div class="flex flex-wrap justify-center">
    <div
      class="section w-full"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'teams'),
        once: true,
      }"
    >
      <h2 class="page-h2 text-center">Best Teams for {{ event.modeName }} - {{ event.map }}</h2>
      <p class="mt-1 md:text-center">
        Discover Brawl Stars Team statistics enhanced with algorithms from Machine Learning.
      </p>
    </div>

    <div class="section w-full">
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="100000"
        :timestamp="totalTimestamp"
        :loading="$fetchState.pending"
        cube="synergy"
      ></meta-slicers>
    </div>

    <div class="section w-full">
      <div class="mx-auto max-w-md card card--dark px-3 py-2 flex">
        <div class="w-14 flex-shrink-0 mt-1">
          <span>Metric</span>
        </div>
        <div class="flex flex-wrap">
          <button
            v-for="m in ['wins', 'winRate', 'picks']"
            :key="m"
            class="mr-2 mb-1 button button--sm"
            :class="{ 'button--selected': measurement == m }"
            @click="measurement = m"
          >
            {{ metaStatMaps.labels[m] }}
          </button>
        </div>
      </div>
    </div>

    <div class="section w-full max-w-md card card--dark px-3 py-2">
      <table class="w-full">
        <thead>
          <tr class="h-8 border-b border-gray-600">
            <th scope="col" class="text-left">
              Brawlers
            </th>
            <th scope="col" class="text-left">
              {{ metaStatMaps.labels[measurement] }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="team in teams.slice(0, (page+1)*pageSize)"
            :key="team.name"
          >
            <td class="pb-1">
              <div class="flex items-center">
                <div class="w-24 md:w-32 bg-gray-900 rounded-sm flex mr-2">
                  <div
                    class="w-1/3"
                    v-for="brawler in team.brawlers"
                    :key="brawler"
                  >
                    <media-img
                      :path="`/brawlers/${brawlerId({ name: brawler })}/avatar`"
                      :alt="brawler"
                      size="160"
                      clazz="h-6 md:h-8"
                    />
                  </div>
                </div>
                <span class="text-sm md:text-lg">{{ team.brawlers.join(', ') }}</span>
              </div>
            </td>
            <td class="text-right font-semibold text-lg">
              {{ metaStatMaps.formatters[measurement](team[measurement]) }}
            </td>
          </tr>
        </tbody>
      </table>
      <button
        v-if="(page+1)*pageSize < teams.length"
        class="mt-2 button button--secondary"
        @click="page++"
      >Load More</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { brawlerId, capitalizeWords, metaStatMaps } from '~/lib/util'
import { PicksWins } from '~/plugins/clicker'

interface Row {
  brawler_name: string
  ally_brawler_name: string
  wins: number
  picks: number
}

interface BMap {
  id: string
  mode: string
  modeName: string
  map: string
}

interface Team {
  name: string
  brawlers: string[]
  picks: number
  wins: number
  winRate: number
}

export default Vue.extend({
  head(): MetaInfo {
    const description = `Brawl Stars Tier List for ${this.event.modeName}: ${this.event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${this.event.modeName}: ${this.event.map}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  props: {
    event: {
      type: Object as PropType<BMap>,
      required: true
    },
  },
  data() {
    return {
      teams: [] as Team[],
      slices: this.$clicker.defaultSlices('synergy'),
      totalSampleSize: 0,
      totalTimestamp: undefined as string|undefined,
      measurement: 'wins',
      page: 0,
      pageSize: 20,
    }
  },
  watch: {
    slices: '$fetch',
    measurement: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const slices = {
      ...this.slices,
      battle_event_mode: [this.event.mode],
      battle_event_map: [this.event.map],
    }

    const bayesStats = await this.$clicker.calculateBayesSynergies(slices, 'meta.map.teams')

    this.totalSampleSize = bayesStats.sampleSize
    this.totalTimestamp = bayesStats.timestamp

    /*
      Let A, B, C be the three Brawlers and H(x) the number of wins or picks.
      We are interested in P(A,B,C).
      We know P(A,B,C) = P(A) * P(B|A) * P(C|A,B).
      Collecting data for H(A,B,C) is expensive (n brawlers -> n^3 permutations)
      but we have H(x) and H(x,y), so we know:
        P(A) = H(A) / H
        P(B,A) = H(B,A) / H
        P(B|A) = P(B,A) / P(A)
               = H(B,A) / H(A)
      We we are missing P(C|A,B).
      We will cheat and calculate it as the weighted average of P(C|A) and P(C|B):
        P(C|A,B) = (P(C|A) * P(A) + P(C|B) * P(B)) / (P(A) + P(B))
                  = (H(C,A) / H(A) * H(A) / H + H(C,B) / H(B) * H(B) / H) / (H(A) / H + H(B) / H)
                  = (H(C,A) + H(C,B)) / (H(A) + H(B))
      This leaves us with
        P(A,B,C) = H(A) / H * H(B,A) / H(A) * (H(C,A) + H(C,B)) / (H(A) + H(B))
      Simplify:
        P(A,B,C) = H(B,A) * (H(C,A) + H(C,B)) / (H(A) + H(B)) / H
    */

    // duoShowdown is an exception because it has 2 player teams
    if (this.event.mode == 'duoShowdown') {
      const teams = new Map<string, PicksWins>()
      bayesStats.pairData.forEach((data, brawler1) => data.forEach((picksWins, brawler2) => {
        bayesStats.addToMap(teams, picksWins, bayesStats.key(brawler1, brawler2))
      }))
      this.teams = [...teams.entries()]
        .map(([id, s]) => ({
          name: id,
          brawlers: bayesStats.unkey(id).map(b => capitalizeWords(b.toLowerCase())),
          picks: s.picks,
          wins: s.wins,
          winRate: s.wins / s.picks,
        }))
        .sort((t1, t2) => t2[this.measurement] - t1[this.measurement])
      return
    }

    const tripleP = new Map<string, PicksWins>()

    for (const [c, hC] of bayesStats.data) {
      for (const [b, hB] of bayesStats.data) {
        for (const [a, hA] of bayesStats.data) {
          const hBA = bayesStats.pairData.get(a)?.get(b)
          const hCA = bayesStats.pairData.get(c)?.get(a)
          const hCB = bayesStats.pairData.get(c)?.get(b)
          // disqualify no data or Brawler duplicates
          if (hBA == undefined || hCA == undefined || hCB == undefined
           || a == b || b == c || c == a) {
            continue
          }
          // = H(B,A) * (H(C,A) + H(C,B)) / (H(A) + H(B)) / H
          // since we would multiply with H later, skip the division
          const data: PicksWins = {
            wins: hBA.wins * (hCA.wins + hCB.wins) / (hA.wins + hB.wins),
            picks: hBA.picks * (hCA.picks + hCB.picks) / (hA.picks + hB.picks),
          }
          bayesStats.addToMap(tripleP, data, bayesStats.key(a, b, c))
        }
      }
    }

    this.teams = [...tripleP.entries()]
      .map(([id, s]) => ({
        name: id,
        brawlers: bayesStats.unkey(id).map(b => capitalizeWords(b.toLowerCase())),
        picks: Math.round(s.picks),
        wins: Math.round(s.wins),
        winRate: s.wins / s.picks,
      }))
      .filter((t) => t.picks >= 10)
      .sort((t1, t2) => t2[this.measurement] - t1[this.measurement])
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
})
</script>
