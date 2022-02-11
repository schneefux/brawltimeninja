<template>
  <div>
    <div class="flex flex-wrap">
      <button
        v-for="(mode, index) in modes"
        :key="mode"
        class="border-r-2 border-t-2 border-b-2 border-white/[0.1] w-12 h-12 flex justify-center items-center"
        :class="['', {
          'rounded-l border-l-2': index == 0,
          'rounded-r': index == modes.length - 1,
          'bg-primary-400 text-gray-800': mode == modeFilter,
          'bg-white/[0.1]': mode != modeFilter,
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

    <scrolling-dashboard
      :length="filteredEvents.length"
      :page-size="4"
      class="mt-8"
    >
      <template v-slot="{ limit }">
        <c-dashboard-cell
          v-for="(event, index) in filteredEvents"
          :key="event.map + '-' + event.id"
          :rows="2"
          :columns="3"
          :class="{
            'lg:hidden': index >= limit,
          }"
          :lazy="index > 4"
          :ssr-key="`active-event-${event.map}-${event.id}`"
        >
          <map-best-brawlers-card
            :slices="{
              mode: [event.mode],
              map: [event.map],
            }"
            :powerplay="event.powerplay"
            :id="event.id"
            :start-date="event.start"
            :end-date="event.end"
          ></map-best-brawlers-card>
        </c-dashboard-cell>
      </template>
    </scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { camelToKebab } from '~/lib/util'
import { CDashboardCell } from '@schneefux/klicker/components'
import { EventMetadata } from '~/plugins/klicker'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    events: {
      type: Array as PropType<EventMetadata[]>,
      required: true
    },
  },
  setup(props) {
    const modeFilter = ref('all')
    const modes = computed(() =>
      [...new Set(['all', ...props.events.map(e => e.mode).sort()])]
    )

    const filteredEvents = computed(() =>
      props.events
        .filter(e => modeFilter.value == 'all' || modeFilter.value == e.mode)
        .sort((e1, e2) => e1.mode.localeCompare(e2.mode))
    )

    return {
      modes,
      modeFilter,
      camelToKebab,
      filteredEvents,
    }
  },
})
</script>
