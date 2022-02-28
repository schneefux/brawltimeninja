<template>
  <div>
    <div
      v-if="modes.length > 2"
      class="flex flex-wrap"
    >
      <button
        v-for="(mode, index) in modes"
        :key="mode"
        :class="[{
          'rounded-l border-l-2': index == 0,
          'rounded-r': index == modes.length - 1,
          'bg-primary-400 text-gray-800': mode == modeFilter,
          'bg-white/[0.1]': mode != modeFilter,
        }]"
        class="border-r-2 border-t-2 border-b-2 border-white/[0.1] w-12 h-12 flex justify-center items-center"
        @click="modeFilter = mode"
      >
        <span v-if="mode == 'all'">{{ $t('option.all') }}</span>
        <media-img
          v-else
          :path="'/modes/' + camelToKebab(mode) + '/icon'"
          size="120"
          clazz="w-8 m-auto"
        ></media-img>
      </button>
    </div>

    <div
      v-if="events.length >= 20"
      class="mt-4 space-x-4"
    >
      <b-textbox
        v-model="nameFilter"
        :placeholder="$tc('map', 1)"
        dark
      ></b-textbox>
    </div>

    <b-scrolling-dashboard class="mt-8">
      <c-dashboard-cell
        v-for="(event, index) in filteredEvents"
        :key="event.map + '-' + event.id + '-' + event.powerplay"
        :rows="2"
        :columns="withData ? 3 : 2"
        :lazy="index > 4"
        :ssr-key="`active-event-${event.map}-${event.id}`"
      >
        <slot :event="event">
          <map-best-brawlers-card
            v-if="withData"
            :slices="{
              mode: [event.mode],
              map: [event.map],
            }"
            :powerplay="event.powerplay"
            :id="event.id"
            :start-date="event.start"
            :end-date="event.end"
          ></map-best-brawlers-card>
          <event-picture-card
            v-else
            :mode="event.mode"
            :map="event.map"
            :id="event.id"
          ></event-picture-card>
        </slot>
      </c-dashboard-cell>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { camelToKebab, slugify } from '~/lib/util'
import { CDashboardCell, BTextbox } from '@schneefux/klicker/components'
import { EventMetadata } from '~/plugins/klicker'

export default defineComponent({
  components: {
    CDashboardCell,
    BTextbox,
  },
  props: {
    events: {
      type: Array as PropType<EventMetadata[]>,
      required: true
    },
    withData: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const modeFilter = ref('all')
    const modes = computed(() =>
      [...new Set(['all', ...props.events.map(e => e.mode).sort()])]
    )

    const nameFilter = ref('')

    const filteredEvents = computed(() =>
      props.events
        .filter(e => (modeFilter.value == 'all' || modeFilter.value == e.mode)
                  && (nameFilter.value == '' || e.map.toLowerCase().includes(nameFilter.value.toLowerCase())))
        .sort((e1, e2) => e1.mode.localeCompare(e2.mode))
    )

    return {
      modes,
      modeFilter,
      nameFilter,
      camelToKebab,
      filteredEvents,
    }
  },
})
</script>
