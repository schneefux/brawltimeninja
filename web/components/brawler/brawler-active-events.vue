<template>
  <div>
    <p class="prose dark:prose-invert">
      {{ description }}
    </p>
    <b-scrolling-dashboard
      v-if="events != undefined"
      :length="events.length"
      :page-size="4"
      class="mt-8"
    >
      <template v-slot="{ limit }">
        <c-dashboard-cell
          v-for="(event, index) in events"
          :key="event.mode + '-' + event.map"
          :rows="2"
          :columns="3"
          :class="{
            'lg:hidden': index >= limit,
          }"
          :lazy="index > 3"
          :ssr-key="`brawler-active-event${event.mode}-${event.map}`"
        >
          <brawler-active-event
            :mode="event.mode"
            :map="event.map"
            :id="event.id"
            :end="event.end"
            :brawler-name="brawlerName"
            :data="event"
            class="w-full h-full"
          ></brawler-active-event>
        </c-dashboard-cell>
      </template>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, useContext, useAsync } from '@nuxtjs/composition-api'
import { formatList, isSpecialEvent, scaleInto } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    brawlerName: {
      // TODO use ID
      type: String,
      required: true
    },
  },
  setup(props) {
    const { $klicker, i18n } = useContext()

    const events = useAsync(() => $klicker.queryActiveEvents(
        ['winRateAdj'], {
        brawler: [props.brawlerName.toUpperCase()],
      }))

    const description = computed(() => {
      if (events.value == undefined) {
        return ''
      }
      const bestEvents = events.value.slice().sort((e1, e2) => (e2.metrics.winRateAdj as number) - (e1.metrics.winRateAdj as number))

      const formatEvent = (r: EventMetadata) => `${i18n.t('mode.' + r.mode) as string} - ${i18n.t('map.' + r.id) as string}`

      const bestMaps = formatList(bestEvents.filter(e => !isSpecialEvent(e.mode)).slice(0, 2).map(formatEvent))
      const viableMaps = bestEvents.filter(e => (<any>e).winRateAdj > 0.55).length
      const viableAmount = scaleInto(0, 1, 3, viableMaps / bestEvents.length)

      return i18n.t('brawler.current-maps.description', {
        brawler: props.brawlerName,
        amount: i18n.t('rating.amount.' + viableAmount) as string,
        maps: bestMaps,
      }) as string
    })

    return {
      events,
      description,
    }
  },
})
</script>
