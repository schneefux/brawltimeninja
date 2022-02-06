<template>
  <div>
    <div class="flex flex-wrap">
      <button
        v-for="(mode, index) in modes"
        :key="mode"
        :class="['border-r-2 border-t-2 border-b-2 border-gray-900 w-12 h-12 flex justify-center items-center', {
          'rounded-l border-l-2': index == 0,
          'rounded-r': index == modes.length - 1,
          'bg-gray-600': true,
          'bg-yellow-400 text-gray-800': mode == modeFilter,
        }]"
        @click="modeFilter = mode"
      >
        <span v-if="mode == 'all'">{{ $t('option.all') }}</span>
        <media-img
          v-else
          :path="'/modes/' + camelToKebab(mode) + '/icon'"
          size="120"
          clazz="w-8 mx-auto my-auto"
        ></media-img>
      </button>
    </div>

    <scrolling-dashboard
      v-if="events != undefined"
      :length="events.length"
      :page-size="4"
      class="mt-8"
    >
      <template v-slot="{ limit }">
        <c-dashboard-cell
          v-for="(event, index) in filteredEvents"
          :key="event.battle_event_map + '-' + event.battle_event_id"
          :rows="2"
          :columns="3"
          :class="{
            'lg:hidden': index >= limit,
          }"
          :lazy="!eager && index > 4"
        >
          <map-best-brawlers-card
            :slices="{
              mode: [event.battle_event_mode],
              map: [event.battle_event_map],
              powerplay: [event.battle_event_powerplay ? 'true' : 'false'],
            }"
            :id="event.battle_event_id"
            :end-date="event.end"
          ></map-best-brawlers-card>
        </c-dashboard-cell>
      </template>
    </scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab } from '~/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { CDashboardCell } from '@schneefux/klicker/components'

export default Vue.extend({
  components: {
    CDashboardCell,
  },
  props: {
    eager: {
      type: Boolean,
    },
  },
  data() {
    return {
      events: [] as EventMetadata[],
      modeFilter: 'all',
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.events = await this.$klicker.queryActiveEvents()
  },
  computed: {
    camelToKebab() {
      return camelToKebab
    },
    modes(): string[] {
      return [...new Set(['all', ...this.events.map(e => e.battle_event_mode).sort()])]
    },
    filteredEvents(): EventMetadata[] {
      return this.events.filter(e => this.modeFilter == 'all' || this.modeFilter == e.battle_event_mode)
    },
  },
})
</script>
