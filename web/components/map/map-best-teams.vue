<template>
  <b-shimmer
    :loading="$fetchState.pending"
    class="mx-auto flex justify-between h-12 w-72"
  >
    <div
      v-for="team in teams.slice(0, limit)"
      :key="team.id"
      class="flex-1 flex flex-col justify-end mx-px"
    >
      <brawler-team
        :brawlers="team.brawlers"
        class="h-full"
      ></brawler-team>
      <p class="mt-1 self-center text-xs">
        {{ team.wins }}
        {{ $t('metric.wins.short') }}
      </p>
    </div>
    <p v-if="!$fetchState.pending && teams.length == 0">
      No data.
    </p>
  </b-shimmer>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/klicker'
import { commonMeasurements } from '~/lib/klicker.conf'

interface Team {
  id: string
  brawlers: string[]
  wins: string
  winRate: number
}

export default Vue.extend({
  props: {
    slices: {
      type: Object as PropType<SliceValue>
    },
    limit: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      teams: [] as Team[],
    }
  },
  watch: {
    slices: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const slices = {
      ...this.$clicker.defaultSlicesRaw('team'),
      ...(this.slices.map != undefined ? {
        battle_event_map: this.slices.map,
      } : {}),
      ...(this.slices.mode != undefined ? {
        battle_event_mode: this.slices.mode,
      } : {}),
      ...(this.slices.season != undefined ? {
        trophy_season_end: [],
        trophy_season_end_exact: this.slices.season,
      } : {}),
    }
    this.teams = []

    const data = await this.$clicker.query('meta.map.best-teams', 'team', ['brawler_names'], ['picks', 'wins', 'battle_victory'], slices, {
      cache: 60*15,
      sort: { wins: 'desc' },
      limit: this.limit,
    })
    this.teams = data.data.map((t) => (<Team>{
      id: t.brawler_names.join('+'),
      brawlers: t.brawler_names,
      wins: this.$klicker.format(commonMeasurements.wins, Math.floor(t.wins)),
      winRate: t.wins / t.picks,
    }))
  },
})
</script>
