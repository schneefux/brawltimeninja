<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <div
      slot="content"
      class="overflow-x-auto"
    >
      <p class="text-base md:text-lg">Best Teams for {{ description }}.</p>
      <b-table
        :columns="columns"
        :rows="rows"
        :page-size="pageSize"
        class="font-semibold text-sm md:text-lg"
      >
        <template v-slot:brawlers="{ row }">
          <div class="flex items-center">
            <brawler-team
              :brawlers="row.brawlers"
              class="flex-shrink-0 md:mr-2 w-16 sm:w-20 md:w-24"
              height="h-6 sm:h-8 md:h-10"
            ></brawler-team>
            <span class="text-xs sm:text-sm md:text-base tracking-tight leading-tight! w-28 md:w-36">{{ row.brawlerNames }}</span>
          </div>
        </template>
      </b-table>
    </div>

    <b-button
      slot="actions"
      :to="dashboardLink"
      secondary
    >
      Explore in Dashboard
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { RawLocation } from 'vue-router'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1, capitalizeWords, MetaGridEntryTiered, scaleEntriesIntoTiers, formatMode } from '../lib/util'
import { Column } from './b-table.vue'

interface Row {
  brawler_names: string[]
  picks: number
  battle_victory: number
}

export default Vue.extend({
  inheritAttrs: false,
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    pageSize: {
      type: Number,
      default: 10
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
    pageSize: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.map.teams', 'team',
      ['brawler_names'],
      ['picks', 'battle_victory'],
      this.slices, {
        sort: { picks: 'desc' },
        cache: 60*30,
      })
    this.data = data.data
  },
  computed: {
    slices(): Record<string, string[]|undefined> {
      const defaultSlices = {
        ...this.$clicker.defaultSlices('team'),
        ...(this.mode != undefined ? {
          battle_event_mode: [this.mode],
        } : {}),
        ...(this.map != undefined ? {
          battle_event_map: [this.map],
        } : {}),
      }
      return this.$clicker.routeToSlices(this.$route, defaultSlices)
    },
    title(): string {
      if (this.mode == undefined) {
        return 'Best Teams in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Teams for ${formatMode(this.mode)}`
      }
      return `Best Teams for ${formatMode(this.mode)} - ${this.map}`
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices)
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'team',
          mode: this.mode,
          map: this.map,
        },
      }
    },
    columns(): Column[] {
      return [{
        title: 'Team',
        key: 'brawlers',
      }, {
        title: metaStatMaps.labels.winRate,
        key: 'winRate',
      }, {
        title: metaStatMaps.labels.picks,
        key: 'picks',
      }]
    },
    rows(): unknown[] {
      return this.data
        .map(e => ({
          brawlers: e.brawler_names,
          brawlerNames: capitalizeWords(e.brawler_names.join(', ').toLowerCase()),
          winRate: metaStatMaps.formatters.winRate(e.battle_victory),
          picks: metaStatMaps.formatters.picks(Math.round(e.picks)),
        }))
    },
  },
})
</script>

<style lang="postcss" scoped>
.leading-tight\! {
  @apply leading-tight !important;
}
</style>
