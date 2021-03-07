<template>
  <card
    :loading="$fetchState.pending"
    :title="$t('best.brawlers.long')"
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
        :key="brawler.name"
        :title="brawler.name"
        :link="localePath(`/tier-list/brawler/${brawler.id}`)"
        :icon="'/brawlers/' + brawler.id + '/avatar'"
        :icon-alt="brawler.name"
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
          {{ brawler.winRate }}
          {{ $t('metric.winRate') }}
        </p>
      </card>
    </horizontal-scroller>

    <b-button
      slot="actions"
      :to="localePath('/tier-list/brawler')"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.tier-list.brawler') }}
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { brawlerId, capitalizeWords } from '~/lib/util'

interface Row {
  id: string
  name: string
  winRate: string
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
  watch: {
    limit: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.brawler.widget', 'map',
      ['brawler_name'],
      ['battle_victory'], {
        ...this.$clicker.defaultSlicesRaw('map'),
        trophy_season_end: ['current'],
      }, {
        sort: { wins_zscore: 'desc' },
        limit: this.limit,
        cache: 60*60,
      })
    this.data = data.data.map((b: any) => ({
      id: brawlerId({ name: b.brawler_name }),
      name: capitalizeWords(b.brawler_name.toLowerCase()),
      winRate: this.$clicker.format(commonMeasurements.winRate, b.battle_victory),
    }))
  },
})
</script>
