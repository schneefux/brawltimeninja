<template>
  <card
    v-bind="$attrs"
    xl
  >
    <div
      slot="content"
      class="overflow-x-auto"
    >
      <p class="text-base md:text-lg">Data for {{ description }}. Open the dashboard for details and options.</p>
      <table class="mt-2 w-full text-sm md:text-lg">
        <thead>
          <tr class="h-8 border-b border-gray-600">
            <th scope="col" class="text-right pr-1">
              #
            </th>
            <th scope="col" class="text-center pr-1">
              Tier
            </th>
            <th scope="col" class="text-left pr-1">
              Name
            </th>
            <th scope="col" class="text-left pr-1">
              {{ metaStatMaps.labels.winRateAdj }}
            </th>
            <th scope="col" class="text-left">
              {{ metaStatMaps.labels.useRate }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in sortedEntries.slice(page*pageSize, (page+1)*pageSize)"
            :key="entry.id"
          >
            <th
              scope="row"
              class="text-right pr-1 pt-1"
            >
              {{ entry.index }}
            </th>
            <td class="text-center pr-1 pt-1">
              {{ entry.tier }}
            </td>
            <td class="pr-1">
              <router-link
                :to="entry.link || ''"
                :title="entry.title"
                class="flex items-center"
              >
                <div class="mr-2 w-10 sm:w-12 md:w-14 bg-gray-900 rounded-sm relative">
                  <media-img
                    :path="`/brawlers/${brawlerId({ name: entry.brawler })}/avatar`"
                    :alt="entry.brawler"
                    size="160"
                    clazz="h-6 sm:h-8 md:h-10"
                  />
                  <media-img
                    v-if="entry.icon"
                    :path="entry.icon"
                    :alt="entry.title"
                    size="80"
                    clazz="h-3 sm:h-5 md:h-6 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-px"
                  />
                </div>
                <span class="font-semibold">{{ entry.title }}</span>
              </router-link>
            </td>
            <td class="text-left font-semibold pr-1">
              {{ metaStatMaps.formatters.winRateAdj(entry.stats.winRateAdj) }}
            </td>
            <td class="text-left font-semibold">
              {{ metaStatMaps.formatters.useRate(entry.stats.useRate) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      slot="actions"
      class="w-full flex flex-col"
    >
      <div class="w-full flex justify-center">
        <paginator
          v-model="page"
          :pages="Math.floor(sortedEntries.length / pageSize)"
          class="w-full"
        ></paginator>
      </div>

      <b-button
        :to="dashboardLink"
        class="mt-3 ml-auto"
        secondary
      >
        Open in Dashboard
      </b-button>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1, capitalizeWords, MetaGridEntryTiered, scaleEntriesIntoTiers } from '../lib/util'

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
      default: 15
    },
  },
  data() {
    return {
      page: 0,
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
    description(): string {
      return this.$clicker.describeSlices(this.slices)
    },
    sortedEntries(): MetaGridEntryTiered[] {
      return scaleEntriesIntoTiers(this.entries, 'winRateAdj')
        .map((e, index) => ({ ...e, index: index + 1 }))
    },
    dashboardLink(): string {
      if (this.mode == undefined) {
        return '/dashboard'
      }
      if (this.map == undefined) {
        return '/dashboard?mode=' + this.mode
      }
      return '/dashboard?mode=' + this.mode + '&map=' + this.map
    },
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
  },
})
</script>
