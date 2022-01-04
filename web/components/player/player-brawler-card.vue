<template>
  <b-card
    :title="title"
    :title-link="localePath(`/tier-list/brawler/${brawlerId}`)"
    :elevation="2"
    sm
  >
    <div
      slot="content"
      class="flex items-center"
    >
      <div class="flex rounded overflow-hidden">
        <media-img
          v-if="brawlerId != undefined"
          :path="'/brawlers/' + brawlerId + '/avatar'"
          :alt="brawler.name"
          size="160"
          clazz="z-0 h-16 sm:h-20"
          class="flex-1"
        ></media-img>
        <div
          v-if="brawler.starPowers.length + brawler.gadgets.length > 0"
          class="bg-gray-900 bg-opacity-75 flex flex-col items-center h-16 sm:h-20 w-5 sm:w-6 p-1 justify-center space-y-1"
        >
          <media-img
            v-for="starpower in brawler.starPowers"
            :key="starpower.id"
            :path="`/starpowers/${starpower.id}`"
            :alt="capitalizeWords(starpower.name.toLowerCase())"
            size="80"
          ></media-img>
          <media-img
            v-for="gadget in brawler.gadgets"
            :key="gadget.id"
            :path="`/gadgets/${gadget.id}`"
            :alt="capitalizeWords(gadget.name.toLowerCase())"
            size="80"
          ></media-img>
        </div>
      </div>
      <table class="ml-auto text-sm sm:text-base">
        <tbody>
          <tr>
            <td class="text-center">
              <img
                src="~/assets/images/icon/leaderboards_optimized.png"
                class="card-prop-icon"
              >
            </td>
            <td class="card-prop-value text-right pr-1">
              {{ brawler.rank }}
            </td>
            <td class="card-prop-label">
              {{ $t('metric.rank') }}
            </td>
          </tr>
          <tr>
            <td class="text-center">
              <img
                src="~/assets/images/icon/trophy_optimized.png"
                class="card-prop-icon"
              >
            </td>
            <td class="card-prop-value text-right pr-1">
              {{ brawler.trophies }}
            </td>
            <td class="card-prop-label">
              {{ $t('metric.trophies') }}
            </td>
          </tr>
          <tr>
            <td class="text-center">
              <img
                :src="brawler.power < 10 ? require('~/assets/images/icon/powerpoint_optimized.png') : require('~/assets/images/icon/starpower_optimized.png')"
                class="card-prop-icon"
              >
            </td>
            <td class="card-prop-value text-right pr-1">
              {{ brawler.power }}
            </td>
            <td class="card-prop-label">
              {{ $t('metric.power-level') }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      slot="actions"
      class="w-full"
    >
      <b-button
        @click="open = !open"
        primary
        class="w-full"
      >
        {{ open ? $t('action.collapse-details') : $t('action.expand-details') }}
      </b-button>
      <div v-if="open">
        <history-graph
          :brawler="brawler.name"
          :player-tag="playerTag"
          class="!block h-32 mt-3"
        ></history-graph>
        <div class="my-2 text-gray-200">
          <table class="mt-4 w-full font-semibold leading-none">
            <tbody>
              <tr class="flex text-2xl">
                <td class="w-1/2 pr-1 text-right">{{ $t('metric.winRate') }}</td>
                <td class="w-1/2 pl-1 text-left text-yellow-400">{{ picks == 0 ? '?' : Math.round(this.winrate * 100) + '%' }}</td>
              </tr>
              <tr class="flex">
                <td class="w-1/2 pr-1 text-right">{{ $t('metric.highest-trophies') }}</td>
                <td class="w-1/2 pl-1 text-left text-yellow-400">{{ brawler.highestTrophies }}</td>
              </tr>
            </tbody>
          </table>
          <div
            v-if="picks > 0"
            class="flex justify-center"
          >
            <span class="w-16 text-green-500 text-right">
              {{ Math.floor(this.winrate * this.picks) }}{{ $t('metric.wins.letter') }}
            </span>
            <span class="px-1">-</span>
            <span class="w-16 text-red-500 text-left">
              {{ Math.floor((1-this.winrate) * this.picks) }}{{ $t('metric.losses.letter') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Brawler } from '~/model/Api'
import { brawlerId, capitalizeWords, formatClickhouse, getSeasonEnd, tagToId } from '~/lib/util'
import { subWeeks } from 'date-fns'

interface BrawlerWithId extends Brawler {
  id: string
}

export default Vue.extend({
  props: {
    playerTag: {
      type: String,
      required: true
    },
    brawler: {
      type: Object as PropType<BrawlerWithId>,
      required: true,
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    enableClickerStats: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      open: this.defaultOpen,
      winrate: 0,
      picks: 0,
    }
  },
  watch: {
    open: '$fetch',
    enableClickerStats: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    if (!this.open || !this.enableClickerStats) {
      return
    }

    const season = formatClickhouse(getSeasonEnd(subWeeks(new Date(), 12)))
    const response = await this.$klicker.query({
      cubeId: 'battle',
      slices: {
        brawler: [this.brawler.name.toUpperCase()],
        playerId: [tagToId(this.playerTag)],
        season: [season],
      },
      dimensionsIds: [],
      measurementsIds: ['winRate', 'picks'],
      sortId: 'picks',
    })
    if (response.data[0].measurementsRaw.picks > 0) {
      this.winrate = response.data[0].measurementsRaw.winRate as number
      this.picks = response.data[0].measurementsRaw.picks as number
    }
  },
  computed: {
    brawlerId(): string {
      return brawlerId({ name: this.brawler.name })
    },
    title(): string {
      return capitalizeWords(this.brawler.name.toLowerCase())
    },
    capitalizeWords()  {
      return capitalizeWords
    },
  },
})
</script>
