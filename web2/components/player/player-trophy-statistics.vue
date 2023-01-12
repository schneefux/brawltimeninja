<template>
  <b-scrolling-dashboard
    @scroll.once="$emit('interact')"
  >
    <b-dashboard-cell
      :rows="2"
      :columns="5"
      lazy
    >
      <history-graph
        :player-tag="player.tag"
        card
      >
        <template v-slot:empty><b-card >
          <template v-slot:content><div

            class="flex flex-col justify-center h-full"
          >
            <p class="italic text-center">
              {{ $t('player.no-history') }}
            </p>
          </div></template>
        </b-card></template>
      </history-graph>
    </b-dashboard-cell>

    <b-dashboard-cell
      :columns="2"
      hide-empty
    >
      <b-bigstat
        v-if="brawlersUnlocked < totalBrawlers"
        :title="$t('metric.potentialTrophies')"
        :value="Math.floor(trophiesGoal).toLocaleString()"
        :tooltip="$t('metric.potentialTrophies.subtext')"
      ></b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell
      :columns="2"
      hide-empty
    >
      <b-bigstat
        v-if="hasPlayerTotals"
        :title="$t('metric.recentWinrate')"
        :value="Math.floor(playerTotals!.winRate * 100) + '%'"
        :tooltip="$t('metric.recentWinrate.description', { battles: playerTotals!.picks })"
      ></b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell
      :columns="2"
      hide-empty
    >
      <b-bigstat
        v-if="hasPlayerTotals"
        :title="$t('metric.averageTrophies')"
        :value="playerTotals!.trophyChange.toFixed(2)"
      ></b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell :columns="2">
      <b-bigstat
        :title="$t('metric.accountRating')"
        :value="accountRating"
        tooltip=""
      >
        <template v-slot:tooltip>
          <p class="mt-2">{{ $t('metric.accountRating.description') }}</p>
          <ul class="mt-1 mb-2">
            <li
              v-for="(info, rating) in ratingPercentiles"
              :key="rating"
            >{{ rating }}: {{ $t('rating.percentile', { percentile: info[0] * 100 + '%' }) }} (up to {{ info[1] }} Trophies)</li>
          </ul>
        </template>
      </b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell
      :columns="2"
      hide-empty
    >
      <b-bigstat
        v-if="hasPlayerTotals"
        :title="$t('metric.wins')"
        :value="Math.floor(playerTotals!.winRate * playerTotals!.picks)"
      ></b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell
      :columns="2"
      hide-empty
    >
      <b-bigstat
        v-if="hasPlayerTotals"
        :title="$t('metric.losses')"
        :value="Math.floor((1 - playerTotals!.winRate) * playerTotals!.picks)"
      ></b-bigstat>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { Player } from '@/model/Api'
import { ratingPercentiles } from '~/lib/util'
import { PlayerTotals } from '~/stores/brawlstars-ninja'
import { BBigstat, BScrollingDashboard, BDashboardCell } from '@schneefux/klicker/components'
import { computed, defineComponent, PropType } from 'vue'
import { useBrawlstarsNinjaStore } from '@/stores/brawlstars-ninja'

export default defineComponent({
  components: {
    BBigstat,
    BScrollingDashboard,
    BDashboardCell,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    playerTotals: {
      type: Object as PropType<PlayerTotals>,
      required: false
    },
  },
  setup(props) {
    const store = useBrawlstarsNinjaStore()

    const brawlersUnlocked = computed(() => Object.keys(props.player.brawlers).length)
    const trophiesGoal = computed(() => {
      const brawlerTrophies = [...Object.values(props.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * store.totalBrawlers
    })
    const accountRating = computed(() => {
      const medTrophies = trophiesGoal.value as number / store.totalBrawlers
      // measured on 2020-11-01 with data from 2020-10-01
      // select quantile(0.25)(player_trophies/player_brawlers_length), quantile(0.375)(player_trophies/player_brawlers_length), quantile(0.5)(player_trophies/player_brawlers_length), quantile(0.90)(player_trophies/player_brawlers_length), quantile(0.95)(player_trophies/player_brawlers_length), quantile(0.99)(player_trophies/player_brawlers_length) from battle where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day and battle_event_powerplay=0
      for (const key in ratingPercentiles) {
        if (medTrophies <= ratingPercentiles[key][1]) {
          return key
        }
      }
      return '?'
    })

    const totalBrawlers = computed<number>(() => store.totalBrawlers)

    const hasPlayerTotals = computed(() => props.playerTotals != undefined && props.playerTotals.picks > 0)

    return {
      trophiesGoal,
      totalBrawlers,
      accountRating,
      brawlersUnlocked,
      ratingPercentiles,
      hasPlayerTotals,
    }
  },
})
</script>
