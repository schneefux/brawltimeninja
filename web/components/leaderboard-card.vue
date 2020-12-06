<template>
  <card title="Best Players">
    <div
      slot="content"
      class="darkbox"
    >
      <player-rank-table
        :columns="columns"
        :column-names="columnNames"
        :rows="rows"
      ></player-rank-table>
    </div>

    <slot name="actions" slot="actions"></slot>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps } from '~/lib/util'
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
  async fetch() {
    const leaderboard = await this.$axios.$get<Leaderboard>('/api/leaderboard/trophies')
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
        trophies: r.metric,
      })).slice(0, this.limit)
    },
    columns(): string[] {
      return ['trophies']
    },
    columnNames(): string[] {
      return ['Trophies']
    },
  },
})
</script>
