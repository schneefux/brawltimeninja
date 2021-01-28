<template>
  <card
    :loading="$fetchState.pending"
    title="Best Brawlers"
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
        v-for="brawler in data"
        :key="brawler.brawler_name"
        :title="brawler.brawler_name"
        :link="`/tier-list/brawler/${brawler.id}`"
        :icon="'/brawlers/' + brawler.id + '/avatar'"
        :icon-alt="brawler.brawler_name"
        size="w-28"
        elevation="2"
        class="flex-shrink-0"
        itemscope
        itemtype="http://schema.org/Person"
        dense
      >
        <p
          slot="content"
          class="text-xs text-center"
        >
          {{ metaStatMaps.formatters.winRate(brawler.battle_victory) }}
          {{ metaStatMaps.labels.winRate }}
        </p>
      </card>
    </horizontal-scroller>

    <b-button
      slot="actions"
      to="/tier-list/brawler"
      primary
      prefetch
      sm
    >
      Open Brawler Tier List
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { brawlerId, capitalizeWords, metaStatMaps } from '~/lib/util'

interface Row {
  id: string
  brawler_name: string
  battle_victory: number
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
      data: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.brawler.widget', 'map',
      ['brawler_name'],
      ['battle_victory'],
      {
        ...this.$clicker.defaultSlices('map'),
        trophy_season_end: ['current'],
      },
      {
        sort: { wins_zscore: 'desc' },
        limit: this.limit,
        cache: 60*60,
      })
    data.data.forEach(r => {
      r.brawler_name = capitalizeWords(r.brawler_name.toLowerCase())
      r.id = brawlerId({ name: r.brawler_name })
    })
    this.data = data.data as any
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    mediaUrl() {
      return process.env.mediaUrl
    },
  },
})
</script>
