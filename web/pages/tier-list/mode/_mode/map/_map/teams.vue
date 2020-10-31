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
  pickRate: number
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
    const pairData = await this.$clicker.query('meta.map.teams', 'synergy',
      ['brawler_name', 'ally_brawler_name'],
      ['wins', 'picks'],
      slices,
      { cache: 60*60 })
    // TODO - might be possible to hit the cheaper map endpoint instead
    const singleData = await this.$clicker.query('meta.map.teams', 'synergy',
      ['brawler_name'],
      ['wins', 'picks', 'timestamp'],
      slices,
      { cache: 60*60 })
    const singleDataRev = await this.$clicker.query('meta.map.teams', 'synergy',
      ['ally_brawler_name'],
      ['wins', 'picks'],
      slices,
      { cache: 60*60 })

    this.totalSampleSize = pairData.totals.picks
    this.totalTimestamp = singleData.totals.timestamp

    /*
      Let A, B, C be the three Brawlers and H(x) the number of wins.
      We are interested in P(A,B,C).
      We know P(A,B,C) = P(A) * P(B|A) * P(C|A,B).
      Collecting data for H(A,B,C) is expensive (n brawlers -> n^3 permutations)
      but we have singles H(x) and pairs H(x,y), so we know:
        P(A) = H(A) / H  [1]
        P(B|A) = H(B,A) / H(A)  [2]
      We we are missing P(C|A,B).
      Bayes theorem states: P(C|A,B) = P(A,B|C) * P(C) / P(A,B)  [3]
      We can look up:
        P(C) = H(C) / H  [4]
        P(A,B) = H(A,B) / H  [5]
      Since we don't have P(C|A,B), we need to cheat and assume
      that (A,B) and (C) are independent:  [*]
        P(A,B|C) = P(A,B) * P(C) / P(C) = P(A,B)  [6]
      This leaves us with
        P_i(A,B,C) =
          [1]    (H(A) / H) *
          [2]    (H(B,A) / H(A)) *
          [3,6]  (H(A,B) / H) *
          [3,4]  (H(C) / H) /
          [3,5]  (H(A,B) / H)
      Simplify:
        P_i(A,B,C) = H(B,A) * H(C) / H^2
      To smooth out the error at [*], we calculate the average
      over all variations:
        P(A,B,C) = (P_i(A,B,C) + P_i(A,C,B) + P_i(B,A,C) + P_i(B,C,A) + P_i(C,A,B) + P_i(C,B,A)) / 6
      The pairs are symmetrical, since H(A,B) = H(B,A) this leads to:
        P(A,B,C) = (2 * H(A,B) * H(C) / H^2 + 2 * H(B,C) * H(A) / H^2 + 2 * H(A,C) * H(B) / H^2) / 6
      Simplify:
        P(A,B,C) = (H(A,B) * H(C) + H(B,C) * H(A) + H(A,C) * H(B)) / 3 / H^2
    */

    interface Stats {
      picks: number
      wins: number
    }
    const key = (...names: string[]) => names.sort().join('+')
    const merge = (map: Map<string, Stats>, row: Stats, key: string) => {
      if (!map.has(key)) {
        map.set(key, { picks: 0, wins: 0 })
      }
      map.get(key)!.picks += row.picks
      map.get(key)!.wins += row.wins
      return map
    }

    // duoShowdown is an exception because it has 2 player teams
    if (this.event.mode == 'duoShowdown') {
      const pairs = new Map<string, Stats>()
      pairData.data.forEach((row) => merge(pairs, row, key(row.brawler_name, row.ally_brawler_name)))
      this.teams = [...pairs.entries()]
        .map(([id, s]) => ({
          name: id,
          brawlers: id.split('+').map(b => capitalizeWords(b.toLowerCase())),
          picks: s.picks,
          wins: s.wins,
          winRate: s.wins / s.picks,
          pickRate: s.picks / pairData.totals.picks,
        }))
        .sort((t1, t2) => t2[this.measurement] - t1[this.measurement])
      return
    }

    // H(A)
    const singleH = new Map<string, Stats>()
    singleData.data.forEach((row) => merge(singleH, row, row.brawler_name))
    singleDataRev.data.forEach((row) => merge(singleH, row, row.ally_brawler_name))
    // H
    const singleTotal = {
      picks: singleData.totals.picks + singleDataRev.totals.picks,
      wins: singleData.totals.wins + singleDataRev.totals.wins,
    }

    // H(A,B) = H(B,A)
    const rowKey = (row: Row) => key(row.brawler_name, row.ally_brawler_name)
    const pairH = new Map<string, Stats>()
    pairData.data.forEach((row) => merge(pairH, row, rowKey(row)))

    const tripleP = new Map<string, Stats>()

    const h2: Stats = {
      wins: singleTotal.wins * singleTotal.wins,
      picks: singleTotal.picks * singleTotal.picks,
    }
    for (const [a, hA] of singleH) {
      for (const [b, hB] of singleH) {
        const hBA = pairH.get(key(b, a))
        // disqualify no data
        if (hBA == undefined) {
          continue
        }

        for (const [c, hC] of singleH) {
          // disqualify Brawler duplicates
          if (a == b || b == c || c == a) {
            continue
          }
          // P(A,B,C) = (H(A,B) * H(C) + H(B,C) * H(A) + H(A,C) * H(B)) / 3 / H^2
          const data = {
            wins: hBA.wins * hC.wins / 3 / h2.wins,
            picks: hBA.picks * hC.picks / 3 / h2.picks,
          }
          merge(tripleP, data, key(a, b, c))
        }
      }
    }

    this.teams = [...tripleP.entries()]
      .map(([id, s]) => ({
        name: id,
        brawlers: id.split('+').map(b => capitalizeWords(b.toLowerCase())),
        picks: Math.round(s.picks * singleTotal.picks),
        wins: Math.round(s.wins * singleTotal.wins),
        winRate: (s.wins * singleTotal.wins) / (s.picks * singleTotal.picks),
        pickRate: s.picks,
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
