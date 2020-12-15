<template>
  <card
    :loading="$fetchState.pending"
    title="Best Players"
    xxl
  >
    <horizontal-scroller
      slot="content"
      expand-on-desktop
    >
      <div
        v-if="$fetchState.pending"
        class="w-full"
        style="height: 68px;"
      ></div>

      <card
        v-for="player in data.slice(0, limit)"
        :key="player.player_tag"
        :title="player.name"
        :link="`/player/${player.tag}`"
        :icon="`/avatars/${player.icon}`"
        size="w-40"
        elevation="2"
        class="flex-shrink-0 whitespace-nowrap"
        itemscope
        itemtype="http://schema.org/Person"
        dense
      >
        <p
          slot="content"
          class="text-sm text-center"
        >
          {{ metaStatMaps.formatters[metric](player.metric) }}
          {{ metaStatMaps.labels[metric] }}
        </p>
      </card>
    </horizontal-scroller>

    <b-button
      slot="actions"
      :to="`/leaderboard/${metric}`"
      primary
      prefetch
    >
      Open {{ capitalize(metric) }} Leaderboard
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { capitalize, capitalizeWords, formatMode, metaStatMaps } from '~/lib/util'
import { Leaderboard, LeaderboardEntry } from '~/model/Api'
import { PlayerRankTableRow } from './player-rank-table.vue'

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
    capitalize() {
      return capitalize
    },
  },
})
</script>
