<template>
  <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
    <lazy
      v-for="(event, index) in events"
      :key="event.battle_event_mode + event.battle_event_map"
      :render="showAllMaps || index <= 2"
      :class="{
        'md:hidden': !showAllMaps && index > 2,
        'mx-4': true,
      }"
      distance="600px"
    >
      <div class="w-80" style="height: 230px" slot="placeholder"></div>
      <brawler-active-event
        :mode="event.battle_event_mode"
        :map="event.battle_event_map"
        :id="event.battle_event_id"
        :end="event.end"
        :brawler-name="brawlerName"
      ></brawler-active-event>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { EventMetadata } from '~/plugins/clicker'
import { decapitalizeFirstLetter } from '../lib/util'
import { CurrentAndUpcomingEvents } from '../model/Api'

export default Vue.extend({
  props: {
    brawlerName: {
      // TODO use ID
      type: String,
      required: true
    },
    showAllMaps: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      events: [] as EventMetadata[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.events = await this.$clicker.queryActiveEvents()
  },
})
</script>
