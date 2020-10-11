<template>
  <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
    <lazy
      v-for="(event, index) in events"
      :key="event.mode + event.map"
      :render="showAllMaps || index <= 2"
      :class="{
        'md:hidden': !showAllMaps && index > 2,
        'mx-4': true,
      }"
      distance="600px"
    >
      <div class="w-80" style="height: 230px" slot="placeholder"></div>
      <brawler-active-event
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :end="event.end"
        :brawler-name="brawlerName"
      ></brawler-active-event>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { decapitalizeFirstLetter } from '../lib/util'
import { ActiveEvent, CurrentAndUpcomingEvents } from '../model/Api'

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
      events: [] as ActiveEvent[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const events = await this.$axios.$get('/api/events/active') as CurrentAndUpcomingEvents
    this.events = events.current
      .map(e => ({
        ...e,
        // starlist returns 'Solo Showdown' as 'Showdown'
        mode: decapitalizeFirstLetter(e.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')),
      }))
  },
})
</script>
