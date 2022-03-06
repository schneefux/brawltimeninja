<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <history-graph
        v-if="enableKlickerStats"
        :card="{ fullHeight: true }"
        :player-tag="player.tag"
      ></history-graph>
      <b-card
        v-else
        full-height
      >
        <div
          slot="content"
          class="flex flex-col justify-center h-full"
        >
          <p
            slot="content"
            class="italic text-center"
          >
            {{ $t('player.no-history') }}
          </p>
        </div>
      </b-card>
    </c-dashboard-cell>

    <b-bigstat
      v-if="player != undefined && player.club.tag != undefined"
      :title="$t('club')"
      class="col-span-2"
    >
      <nuxt-link
        slot="content"
        :to="localePath(`/club/${player.club.tag}`)"
        class="underline"
      >
        [{{ player.club.name.replace(/ /g, '&nbsp;')}}]
      </nuxt-link>
    </b-bigstat>

    <b-bigstat
      :title="$t('metric.trophies')"
      :value="player != undefined ? player.trophies.toLocaleString() : '?'"
    ></b-bigstat>

    <b-bigstat
      v-if="brawlersUnlocked < totalBrawlers"
      :title="$t('metric.potentialTrophies')"
      :value="Math.floor(trophiesGoal).toLocaleString()"
      :tooltip="$t('metric.potentialTrophies.subtext')"
    ></b-bigstat>

    <b-bigstat
      v-if="playerTotals != undefined && playerTotals.picks > 0"
      :title="$t('metric.recentWinrate')"
      :value="Math.floor(playerTotals.winRate * 100) + '%'"
      :tooltip="$t('metric.recentWinrate.description', { battles: playerTotals.picks })"
    ></b-bigstat>

    <b-bigstat
      v-if="playerTotals != undefined && playerTotals.picks > 0"
      :title="$t('metric.averageTrophies')"
      :value="playerTotals.trophyChange.toFixed(2)"
    ></b-bigstat>

    <b-bigstat
      :title="$t('metric.accountRating')"
      :value="accountRating"
      tooltip
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
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { Player } from '@/model/Api'
import { ratingPercentiles, xpToHours } from '~/lib/util'
import { PlayerTotals } from '~/store'
import { BBigstat, BScrollingDashboard } from '@schneefux/klicker/components'
import { computed, defineComponent, onMounted, PropType, useContext, useStore, wrapProperty } from '@nuxtjs/composition-api'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    BBigstat,
    BScrollingDashboard,
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
    enableKlickerStats: {
      type: Boolean,
      default: false
    },
  },
  // TODO replace refs by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const store = useStore<any>()
    const { localePath, i18n } = useContext()

    const brawlersUnlocked = computed(() => Object.keys(props.player.brawlers).length)
    const trophiesGoal = computed(() => {
      const brawlerTrophies = [...Object.values(props.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * store.state.totalBrawlers
    })
    const accountRating = computed(() => {
      const medTrophies = trophiesGoal.value as number / store.state.totalBrawlers
      // measured on 2020-11-01 with data from 2020-10-01
      // select quantile(0.25)(player_trophies/player_brawlers_length), quantile(0.375)(player_trophies/player_brawlers_length), quantile(0.5)(player_trophies/player_brawlers_length), quantile(0.90)(player_trophies/player_brawlers_length), quantile(0.95)(player_trophies/player_brawlers_length), quantile(0.99)(player_trophies/player_brawlers_length) from battle where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day and battle_event_powerplay=0
      for (const key in ratingPercentiles) {
        if (medTrophies <= ratingPercentiles[key][1]) {
          return key
        }
      }
      return '?'
    })

    const totalBrawlers = computed<number>(() => store.state.totalBrawlers)

    return {
      trophiesGoal,
      totalBrawlers,
      accountRating,
      brawlersUnlocked,
      ratingPercentiles,
    }
  },
})
</script>
