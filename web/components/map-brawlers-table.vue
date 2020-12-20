<template>
  <card
    v-bind="$attrs"
    :title="title"
  >
    <div
      slot="content"
      class="overflow-x-auto flex flex-col h-full"
    >
      <p class="text-base md:text-lg">Brawl Stars Tier List for {{ description }}.</p>
      <b-table
        :columns="columns"
        :rows="rows"
        :page-size="pageSize"
        class="font-semibold text-sm md:text-lg h-full"
        ranked
      >
        <template v-slot:name="{ row }">
          <router-link
            :to="row.link"
            :title="row.title"
            class="flex items-center"
          >
            <div class="mr-2 w-10 sm:w-12 md:w-14 relative">
              <media-img
                :path="`/brawlers/${row.brawlerId}/avatar`"
                :alt="row.brawler"
                size="160"
                clazz="h-6 sm:h-8 md:h-10"
              />
              <media-img
                v-if="row.icon"
                :path="row.icon"
                :alt="row.title"
                size="80"
                clazz="h-3 sm:h-5 md:h-6 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-px"
              />
            </div>
            <span class="w-16 md:w-24">{{ row.title }}</span>
          </router-link>
        </template>
      </b-table>
    </div>

    <b-button
      slot="actions"
      :to="dashboardLink"
      secondary
      sm
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
      entries: [] as MetaGridEntry[],
    }
  },
  watch: {
    mode: '$fetch',
    map: '$fetch',
    pageSize: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.map', 'map',
      ['brawler_name'],
      ['battle_victory_adj', 'battle_starplayer', 'picks_weighted', 'picks', 'timestamp'],
      this.slices, {
        sort: { picks: 'desc' },
        cache: 60*30,
      })

    this.entries = this.$clicker.mapToMetaGridEntry(['winRateAdj', 'useRate', 'starRate'], data.data, data.totals)
  },
  computed: {
    slices(): Record<string, string[]|undefined> {
      const defaultSlices = {
        ...this.$clicker.defaultSlices('map'),
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
        return 'Best Brawlers in Brawl Stars'
      }
      if (this.map == undefined) {
        return `Best Brawlers for ${formatMode(this.mode)}`
      }
      return `Best Brawlers for ${formatMode(this.mode)} - ${this.map}`
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices)
    },
    columns(): Column[] {
      return [{
        title: 'Tier',
        key: 'tier',
      }, {
        title: 'Name',
        key: 'name',
      }, {
        title: metaStatMaps.labels.winRateAdj,
        key: 'winRateAdj',
      }, {
        title: metaStatMaps.labels.useRate,
        key: 'useRate',
      }]
    },
    rows(): unknown[] {
      return scaleEntriesIntoTiers(this.entries, 'winRateAdj')
        .map(e => ({
          tier: e.tier,
          name: e.title,
          winRateAdj: metaStatMaps.formatters.winRateAdj(e.stats.winRateAdj as number),
          useRate: metaStatMaps.formatters.useRate(e.stats.useRate as number),
          link: e.link || '',
          brawlerId: brawlerId({ name: e.brawlers[0] }),
          brawler: e.brawlers[0],
          title: e.title,
          icon: e.icon,
        }))
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'map',
          mode: this.mode,
          map: this.map,
        },
      }
    },
  },
})
</script>
