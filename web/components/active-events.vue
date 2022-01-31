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

    <lazy
      :render="eager"
      distance="320px"
    >
      <scrolling-dashboard class="mt-8">
        <map-best-brawlers-card
          v-for="(event, index) in filteredEvents"
          :key="event.battle_event_map + '-' + event.battle_event_id"
          :slices="{
            mode: [event.battle_event_mode],
            map: [event.battle_event_map],
            powerplay: [event.battle_event_powerplay ? 'true' : 'false'],
          }"
          :id="event.battle_event_id"
          :end-date="event.end"
          :eager="eager"
          :class="{
            'md:hidden': index >= (page + 1) * 3,
          }"
          class="dashboard__cell"
          style="--rows: 1; --columns: 4;"
        ></map-best-brawlers-card>
      </scrolling-dashboard>
    </lazy>

    <accordeon-buttons
      v-model="page"
      :pages="events != undefined ? events.length / 3 : 0"
      class="hidden md:flex"
    ></accordeon-buttons>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { camelToKebab } from '~/lib/util'
import { EventMetadata } from '~/plugins/klicker'

export default Vue.extend({
  props: {
    eager: {
      type: Boolean,
    },
  },
  data() {
    return {
      events: [] as EventMetadata[],
      modeFilter: 'all',
      page: 0,
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
