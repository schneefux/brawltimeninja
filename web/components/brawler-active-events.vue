<template>
  <div>
    <p>
      {{ description }}
    </p>
    <div class="mt-2 overflow-x-auto scrolling-touch flex items-center md:justify-center md:flex-wrap">
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
          :data="event"
        ></brawler-active-event>
      </lazy>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { EventMetadata } from '~/plugins/clicker'
import { decapitalizeFirstLetter, formatList, formatMode, isSpecialEvent, scaleInto } from '../lib/util'
import { CurrentAndUpcomingEvents } from '../model/Api'

interface Row extends EventMetadata {
  battle_victory: number
  battle_victory_adj: number
}

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
      events: [] as Row[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.events = await this.$clicker.queryActiveEvents<Row>(
      ['battle_victory_adj', 'battle_victory', 'picks_weighted', 'wins'], {
      brawler_name: [this.brawlerName.toUpperCase()],
    }, 120)
  },
  computed: {
    description(): string {
      if (this.events.length == 0) {
        return ''
      }
      const bestEvents = this.events.slice().sort((e1, e2) => e2.battle_victory_adj - e1.battle_victory_adj)

      const formatEvent = (r: Row) => `${formatMode(r.battle_event_mode)} - ${r.battle_event_map}`

      const bestMaps = formatList(bestEvents.filter(e => !isSpecialEvent(e.battle_event_mode)).slice(0, 2).map(formatEvent))
      const viableMaps = bestEvents.filter(e => e.battle_victory_adj > 0.55).length
      const viableWords = ['no', 'some', 'a few', 'all']
      const viableWord = viableWords[scaleInto(0, 1, viableWords.length - 1, viableMaps / bestEvents.length)]

      return `
        ${this.brawlerName} has a good win rate on ${viableWord} maps today.
        If you want to play ${this.brawlerName}, the best maps are ${bestMaps}.
      `
    },
  },
})
</script>
