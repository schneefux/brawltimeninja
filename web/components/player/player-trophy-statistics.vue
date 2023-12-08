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
        :card="{}"
      >
        <template v-slot:empty>
          <b-card>
            <template v-slot:content>
              <div class="flex flex-col justify-center h-full">
                <p class="italic text-center">
                  {{ $t('player.no-history') }}
                </p>
              </div>
            </template>
          </b-card>
        </template>
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
        v-if="hasPlayerTotals && !isNaN(playerTotals!.trophyChange)"
        :title="$t('metric.averageTrophies')"
        :value="playerTotals!.trophyChange.toFixed(2)"
      ></b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell :columns="2">
      <b-bigstat
        :title="$t('metric.accountRating')"
        :value="rating"
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
import { Player } from '~/model/Api'
import { calculateAccountRating, ratingPercentiles } from '~/lib/util'
import { PlayerTotals } from '~/stores/brawlstars'
import { BBigstat, BScrollingDashboard, BDashboardCell } from '@schneefux/klicker/components'
import { computed, defineComponent, PropType } from 'vue'
import { useBrawlstarsStore } from '~/stores/brawlstars'

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
    const store = useBrawlstarsStore()

    const totalBrawlers = computed<number>(() => store.totalBrawlers)
    const accountRating = computed(() => calculateAccountRating(props.player, totalBrawlers.value))
    const brawlersUnlocked = computed(() => accountRating.value.brawlersUnlocked)
    const trophiesGoal = computed(() => accountRating.value.trophiesGoal)
    const rating = computed(() => accountRating.value.rating)

    const hasPlayerTotals = computed(() => props.playerTotals != undefined && props.playerTotals.picks > 0)

    return {
      trophiesGoal,
      totalBrawlers,
      rating,
      brawlersUnlocked,
      ratingPercentiles,
      hasPlayerTotals,
    }
  },
})
</script>
