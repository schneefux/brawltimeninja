<template>
  <card
    title="Best Players"
    :subtitle="subtitle"
  >
    <template v-slot:content>
      <p>
        Players with most wins recorded by Brawl Time Ninja this season.
      </p>
      <div class="mt-2 darkbox">
        <player-rank-table
          :columns="['wins', 'winRate']"
          :column-names="columnNames"
          :rows="rows"
        ></player-rank-table>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatMode, metaStatMaps } from '~/lib/util'
import { PlayerRankTableRow } from './player-rank-table.vue'

interface Row {
  player_name: string
  player_tag: string
  player_icon_id: number
  wins: number
  battle_victory: number
}

export default Vue.extend({
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [String, Number],
    },
    timestamp: {
      type: String,
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('mode.leaderboard',
      'battle',
      ['player_id'],
      ['player_name', 'player_icon_id' , 'wins', 'battle_victory'], {
        ...this.$clicker.defaultSlices('battle'),
        trophy_season_end: ['current'],
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
      }, {
        cache: 60*60,
        sort: {
          wins: 'desc',
        },
        limit: 5,
      })

    this.data = data.data
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    rows(): PlayerRankTableRow[] {
      return this.data.map(r => ({
        player_name: r.player_name,
        player_tag: r.player_tag,
        player_icon_id: r.player_icon_id,
        wins: metaStatMaps.formatters.wins(r.wins),
        winRate: metaStatMaps.formatters.winRate(r.battle_victory),
      }))
    },
    columnNames() {
      return [metaStatMaps.labelsShort.wins, metaStatMaps.labelsShort.winRate]
    },
    subtitle(): string {
      if (this.mode == undefined) {
        return ''
      }
      if (this.map == undefined) {
        return `in ${formatMode(this.mode)}`
      }
      return `in ${formatMode(this.mode)} - ${this.map}`
    },
  },
})
</script>
