<template>
  <div>
    <p class="prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">
      {{ description }}
    </p>
    <b-scrolling-list
      :items="events != undefined ? events : []"
      :cell-rows="2"
      :cell-columns="3"
      class="mt-8"
      key-id="key"
      render-placeholder
    >
      <template v-slot:item="event">
        <brawler-active-event
          v-if="brawlerMetadata != undefined"
          :mode="event.mode"
          :map="event.map"
          :event-id="event.id"
          :end="event.end"
          :brawler-metadata="brawlerMetadata"
          :data="event"
          class="w-full h-full"
        ></brawler-active-event>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef } from 'vue'
import { formatList, isSpecialEvent, scaleInto } from '~/lib/util'
import { EventMetadata } from '~/plugins/klicker.service'
import { BScrollingList } from '@schneefux/klicker/components'
import { BrawlerMetadata, useActiveEvents } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'
import { PropType } from 'vue'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: false
    },
  },
  setup(props) {
    const i18n = useI18n()

    let events: ComputedRef<EventMetadata[]>|undefined = undefined

    if (props.brawlerMetadata != undefined) {
      events = useActiveEvents(
        ['winRateAdj'], {
        brawler: [props.brawlerMetadata?.brawlstarsId],
      })
    }

    const description = computed(() => {
      if (events?.value == undefined || props.brawlerMetadata == undefined) {
        return ''
      }

      const bestEvents = events.value.slice().sort((e1, e2) => (e2.metrics.winRateAdj as number) - (e1.metrics.winRateAdj as number))

      const formatEvent = (r: EventMetadata) => `${i18n.t('mode.' + r.mode)} - ${i18n.t('map.' + r.id)}`

      const bestMaps = formatList(bestEvents.filter(e => !isSpecialEvent(e.mode)).slice(0, 2).map(formatEvent))
      const viableMaps = bestEvents.filter(e => (<any>e).winRateAdj > 0.55).length
      const viableAmount = scaleInto(0, 1, 3, viableMaps / bestEvents.length)

      return i18n.t('brawler.current-maps.description', {
        brawler: props.brawlerMetadata.name,
        amount: i18n.t('rating.amount.' + viableAmount),
        maps: bestMaps,
      })
    })

    return {
      events,
      description,
    }
  },
})
</script>
