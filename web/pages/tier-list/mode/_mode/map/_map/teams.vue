<template>
  <page-section
    :title="'Best Teams for ' + event.modeName + ' - ' + event.map"
    tracking-id="teams"
    tracking-page-id="map_meta"
  >
    <p slot="description">
      Discover Brawl Stars Team statistics enhanced with algorithms from Machine Learning.
    </p>

    <meta-slicers
      v-model="slices"
      :sample="totalSampleSize"
      :sample-min="100000"
      :timestamp="totalTimestamp"
      :loading="$fetchState.pending"
      cube="synergy"
      class="mx-auto"
    ></meta-slicers>

    <card
      class="mx-auto"
      md
    >
      <div slot="content" class="flex">
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
    </card>

    <card
      class="mx-auto"
      md
    >
      <template v-slot:content>
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
                  <brawler-team
                    :brawlers="team.brawlers"
                    class="w-32 flex-shrink-0"
                  ></brawler-team>
                  <p class="text-sm md:text-lg">
                    {{ capitalizeWords(team.brawlers.join(', ').toLowerCase()) }}
                  </p>
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
      </template>
    </card>
  </page-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { brawlerId, capitalizeWords, measurementMap, metaStatMaps } from '~/lib/util'

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
  middleware: ['cached'],
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

    const sortingKey = this.measurement == 'winRate' ? 'battle_victory' : this.measurement
    const data = await this.$clicker.query('meta.map.teams', 'team', ['brawler_names'], ['picks', 'wins', 'battle_victory'], slices, {
      cache: 60*15,
      sort: { [sortingKey]: 'desc' },
    })
    this.teams = data.data
      .map((teamPicksWins) => ({
        name: teamPicksWins.brawler_names.join('+'),
        brawlers: teamPicksWins.brawler_names,
        picks: Math.round(teamPicksWins.picks),
        wins: Math.round(teamPicksWins.wins),
        winRate: teamPicksWins.wins / teamPicksWins.picks,
      }))
      .filter((t) => t.picks >= 10)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
  computed: {
    capitalizeWords() {
      return capitalizeWords
    },
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
        this.$gtag.event('scroll', {
          'event_category': 'map_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
