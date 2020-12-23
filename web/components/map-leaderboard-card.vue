<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <template v-slot:content>
      <p class="w-64">
        {{ isShowdown ? 'Most successful players' : 'Players with most wins'}}
        in Brawl Stars this season.
      </p>
      <b-table
        slot="content"
        :columns="columns"
        :rows="rows"
        ranked
      >
        <template v-slot:player="{ row }">
          <router-link :to="`/player/${row.player_tag}`">
            {{ row.player }}
          </router-link>
        </template>
        <template v-slot:brawler="{ row }">
          <router-link :to="`/tier-list/brawler/${row.brawlerId}`">
            <media-img
              :path="`/brawlers/${row.brawlerId}/avatar`"
              :alt="row.brawlerName"
              clazz="h-6"
            ></media-img>
          </router-link>
        </template>
      </b-table>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerId, capitalizeWords, formatMode, metaStatMaps } from '~/lib/util'
import { Column } from './b-table.vue'
import { PlayerRankTableRow } from './player-rank-table.vue'

interface Row {
  player_name: string
  player_tag: string
  brawler_name: string
  picks: number
  wins: number
  battle_victory: number
  battle_rank: number
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
  },
  data() {
    return {
      data: [] as Row[],
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('mode.leaderboard',
      'battle',
      ['player_id'],
      ['player_name', 'brawler_name' , ...(this.isShowdown? ['picks', 'battle_rank'] : ['wins', 'battle_victory'])], {
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
        sort: { wins: 'desc' },
        limit: 5,
      })

    this.data = data.data
  },
  computed: {
    rows(): unknown[] {
      return this.data.map(r => ({
        player: r.player_name,
        player_tag: r.player_tag.slice(1),
        brawler: capitalizeWords(r.brawler_name.toLowerCase()),
        brawlerId: brawlerId({ name: r.brawler_name }),
        ...(this.isShowdown ? {
          picks: metaStatMaps.formatters.picks(r.picks),
          rank: metaStatMaps.formatters.rank(r.battle_rank),
        } : {
          wins: metaStatMaps.formatters.wins(Math.floor(r.wins)),
          winRate: metaStatMaps.formatters.winRate(r.battle_victory),
        }),
      }))
    },
    columns(): Column[] {
      return this.isShowdown ? [{
        title: 'Player',
        key: 'player',
      }, {
        title: 'Brawler',
        key: 'brawler',
      }, {
        title: metaStatMaps.labels.picks,
        key: 'picks',
      }, {
        title: metaStatMaps.labels.rank,
        key: 'rank',
      }] : [{
        title: 'Player',
        key: 'player',
      }, {
        title: 'Brawler',
        key: 'brawler',
      }, {
        title: metaStatMaps.labels.wins,
        key: 'wins',
      }, {
        title: metaStatMaps.labels.winRate,
        key: 'winRate',
      }]
    },
    title(): string {
      if (this.mode == undefined) {
        return 'Best Players in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Players in ${formatMode(this.mode)}`
      }
      return `Best Players in ${formatMode(this.mode)} - ${this.map}`
    },
    isShowdown(): boolean {
      return this.mode != undefined && this.mode.toLowerCase().includes('showdown')
    },
  },
})
</script>
