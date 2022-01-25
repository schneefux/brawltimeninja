<template>
  <div>
    <p>
      {{ description }}
    </p>
    <b-horizontal-scroller
      class="mt-2"
      expand-on-desktop
    >
      <lazy
        v-for="(event, index) in events"
        :key="event.battle_event_mode + event.battle_event_map"
        :render="showAllMaps || index <= 2"
        distance="600px"
        class="mx-2"
      >
        <div
          class="w-80"
          style="height: 230px"
          slot="placeholder"
          :class="{
            'md:hidden': !showAllMaps && index > 2,
          }"
        ></div>
        <brawler-active-event
          :mode="event.battle_event_mode"
          :map="event.battle_event_map"
          :id="event.battle_event_id"
          :end="event.end"
          :brawler-name="brawlerName"
          :data="event"
          :class="{
            'md:hidden': !showAllMaps && index > 2,
          }"
        ></brawler-active-event>
      </lazy>
    </b-horizontal-scroller>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatList, isSpecialEvent, scaleInto } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { BHorizontalScroller } from 'klicker/components'

export default Vue.extend({
  components: {
    BHorizontalScroller,
  },
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
  fetchOnServer: false,
  async fetch() {
    this.events = await this.$klicker.queryActiveEvents(
      ['winRateAdj'], {
      brawler: [this.brawlerName.toUpperCase()],
    }, 120)
  },
  computed: {
    description(): string {
      if (this.events.length == 0) {
        return ''
      }
      const bestEvents = this.events.slice().sort((e1, e2) => (<any>e2).winRateAdj - (<any>e1).winRateAdj)

      const formatEvent = (r: EventMetadata) => `${this.$i18n.t('mode.' + r.battle_event_mode) as string} - ${this.$i18n.t('map.' + r.battle_event_id) as string}`

      const bestMaps = formatList(bestEvents.filter(e => !isSpecialEvent(e.battle_event_mode)).slice(0, 2).map(formatEvent))
      const viableMaps = bestEvents.filter(e => (<any>e).winRateAdj > 0.55).length
      const viableAmount = scaleInto(0, 1, 3, viableMaps / bestEvents.length)

      return this.$i18n.t('brawler.current-maps.description', {
        brawler: this.brawlerName,
        amount: this.$i18n.t('rating.amount.' + viableAmount) as string,
        maps: bestMaps,
      }) as string
    },
  },
})
</script>
