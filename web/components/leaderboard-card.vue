<template>
  <card title="Best Players">
    <template v-slot:content>
      <p class="w-64">
        Players ranked by most {{ columnNames[0] }}.
      </p>
      <player-rank-table
        :columns="columns"
        :column-names="columnNames"
        :rows="rows"
      ></player-rank-table>
    </template>

    <slot name="actions" slot="actions"></slot>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { capitalizeWords, formatMode, metaStatMaps } from '~/lib/util'
import { Leaderboard, LeaderboardEntry } from '~/model/Api'
import { PlayerRankTableRow } from './player-rank-table.vue'

interface Row {
  player_name: string
  player_tag: string
  player_icon_id: number
  picks: number
  wins: number
  battle_victory: number
  battle_rank: number
}

export default Vue.extend({
  props: {
    metric: {
      type: String,
      default: 'trophies'
    },
    limit: {
      type: Number,
      default: 5
    },
  },
  data() {
    return {
      data: [] as LeaderboardEntry[],
    }
  },
  fetchDelay: 0,
  watch: {
    metric: '$fetch',
  },
  async fetch() {
    const leaderboard = await this.$axios.$get<Leaderboard>('/api/leaderboard/' + this.metric)
    this.data = leaderboard.entries
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    rows(): PlayerRankTableRow[] {
      return this.data.map(r => ({
        player_name: r.name,
        player_tag: r.tag,
        player_icon_id: r.icon,
        [this.metric]: r.metric,
      })).slice(0, this.limit)
    },
    columns(): string[] {
      return [this.metric]
    },
    columnNames(): string[] {
      return [capitalizeWords(this.metric)]
    },
  },
})
</script>
