<template>
  <div class="flex flex-wrap justify-center items-end">
    <lzy-map-best-brawlers-card
      v-for="event in events"
      :key="event.battle_event_map + '-' + event.battle_event_id"
      :mode="event.battle_event_mode"
      :map="event.battle_event_map"
      :id="event.battle_event_id"
      :powerplay="event.battle_event_powerplay"
      :end-date="event.end"
      :eager="eager"
      link
    ></lzy-map-best-brawlers-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { EventMetadata } from '~/plugins/cube'

export default Vue.extend({
  props: {
    eager: {
      type: Boolean,
    },
  },
  data() {
    return {
      events: [] as EventMetadata[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.events = await this.$cube.queryActiveEvents()
  },
})
</script>
