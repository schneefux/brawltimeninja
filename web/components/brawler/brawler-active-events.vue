<template>
  <div>
    <p class="mx-1">
      {{ description }}
    </p>
    <div
      v-if="events != undefined"
      class="mt-6 dashboard dashboard--horizontal md:dashboard--vertical md:dashboard--responsive dashboard--relaxed"
    >
      <lazy
        v-for="(event, index) in events"
        :key="event.battle_event_mode + event.battle_event_map"
        :render="index <= 2"
        distance="600px"
        :class="['dashboard__cell', {
          'md:hidden': index >= (page + 1) * 3,
        }]"
        style="--rows: 2; --columns: 3;"
      >
        <div slot="placeholder"></div>
        <brawler-active-event
          :mode="event.battle_event_mode"
          :map="event.battle_event_map"
          :id="event.battle_event_id"
          :end="event.end"
          :brawler-name="brawlerName"
          :data="event"
          class="w-full h-full"
        ></brawler-active-event>
      </lazy>
    </div>

    <div class="mt-4 w-full flex justify-end">
      <b-button
        v-if="page > 0"
        class="mx-2"
        primary
        sm
        @click="collapse"
      >
        {{ $t('action.collapse') }}
      </b-button>
      <b-button
        v-if="page < pages"
        class="mx-2"
        primary
        sm
        @click="expand"
      >
        {{ $t('action.expand') }}
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, useContext, useAsync, ref } from '@nuxtjs/composition-api'
import { formatList, isSpecialEvent, scaleInto } from '@/lib/util'
import { EventMetadata } from '~/plugins/klicker'

export default defineComponent({
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
  setup(props) {
    const { $klicker, i18n } = useContext()

    function fetch() {
      return $klicker.queryActiveEvents(
        ['winRateAdj'], {
        brawler: [props.brawlerName.toUpperCase()],
      }, 120) as Promise<EventMetadata[]>
    }

    const events = useAsync(() => fetch())

    const description = computed(() => {
      if (events.value == undefined) {
        return ''
      }
      const bestEvents = events.value.slice().sort((e1, e2) => (<any>e2).winRateAdj - (<any>e1).winRateAdj)

      const formatEvent = (r: EventMetadata) => `${i18n.t('mode.' + r.battle_event_mode) as string} - ${i18n.t('map.' + r.battle_event_id) as string}`

      const bestMaps = formatList(bestEvents.filter(e => !isSpecialEvent(e.battle_event_mode)).slice(0, 2).map(formatEvent))
      const viableMaps = bestEvents.filter(e => (<any>e).winRateAdj > 0.55).length
      const viableAmount = scaleInto(0, 1, 3, viableMaps / bestEvents.length)

      return i18n.t('brawler.current-maps.description', {
        brawler: props.brawlerName,
        amount: i18n.t('rating.amount.' + viableAmount) as string,
        maps: bestMaps,
      }) as string
    })

    const page = ref(0)
    const expand = () => page.value++
    const collapse = () => page.value = 0
    const pages = computed(() => events.value == undefined ? 0 : events.value.length)

    return {
      events,
      description,
      page,
      expand,
      collapse,
      pages,
    }
  },
})
</script>
