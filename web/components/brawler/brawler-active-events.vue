<template>
  <div>
    <p class="prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">
      {{ description }}
    </p>
    <b-scrolling-list
      v-if="events != undefined"
      class="mt-8"
      :items="events"
      :cell-rows="2"
      :cell-columns="3"
      :eager-until="3"
      key-id="key"
    >
      <template v-slot:item="event">
        <brawler-active-event
          :mode="event.mode"
          :map="event.map"
          :id="event.id"
          :end="event.end"
          :brawler-name="brawlerName"
          :data="event"
          class="w-full h-full"
        ></brawler-active-event>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, useContext, useAsync } from '@nuxtjs/composition-api'
import { formatList, isSpecialEvent, scaleInto } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'
import { BScrollingList } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
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
    }), `active-events-${props.brawlerName}`)

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
