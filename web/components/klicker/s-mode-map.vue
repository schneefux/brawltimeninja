<template>
  <div>
    <b-fake-select @open="lightboxOpen = true">
      <template v-slot:preview>
        <span class="w-48 text-left truncate">
          <template v-if="activeNonRankedEventsAvailable && selectedActiveNonRankedMaps">{{ $t('option.all-maps') }}: {{ $t('events.active.title') }}</template>
          <template v-else-if="activeRankedEventsAvailable && selectedActiveRankedMaps">{{ $t('option.all-maps') }}: {{ $t('events.ranked.title') }}</template>
          <template v-else>{{ mode != undefined ? $t('mode.' + mode) + ' - ' : '' }}{{ mapNames ?? $t('option.all-maps') }}</template>
        </span>
      </template>
    </b-fake-select>

    <b-lightbox
      v-model="lightboxOpen"
      class="top-14 lg:top-0 bottom-14 lg:bottom-0 h-[calc(100vh-2*3.5rem)] lg:h-screen overscroll-contain"
    >
      <b-card
        class="w-full overflow-y-auto overscroll-contain"
        :elevation="0"
      >
        <template v-slot:content>
          <events-roll
            v-if="allEventsAndSummaries != undefined"
            :events="allEventsAndSummaries"
            :mode-filter-default="mode"
          >
            <template v-slot="{ event }">
              <b-card
                v-if="event.key == 'all'"
                :title="$t('option.all-maps')"
              >
                <template v-slot:content>
                  <div class="pt-8 space-y-4 text-center">
                    <b-button
                      :dark="!(mode == undefined && map == undefined)"
                      :primary="mode == undefined && map == undefined"
                      class="w-full"
                      md
                      @click.capture.prevent="onSelectModeMap({})"
                    >
                      {{ $t('option.all-maps') }}
                    </b-button>
                    <b-button
                      v-if="activeNonRankedEventsAvailable"
                      :dark="!selectedActiveNonRankedMaps"
                      :primary="selectedActiveNonRankedMaps"
                      class="w-full"
                      md
                      @click.capture.prevent="onSelectAllActiveMaps()"
                    >
                      {{ $t('option.all-maps') }}: {{ $t('events.active.title') }}
                    </b-button>
                    <b-button
                      v-if="activeRankedEventsAvailable"
                      :dark="!selectedActiveRankedMaps"
                      :primary="selectedActiveRankedMaps"
                      class="w-full"
                      md
                      @click.capture.prevent="onSelectAllRankedMaps()"
                    >
                      {{ $t('option.all-maps') }}: {{ $t('events.ranked.title') }}
                    </b-button>
                  </div>
                </template>
              </b-card>
              <event-card
                v-else-if="event.key.startsWith('all-mode-')"
                :mode="event.mode"
                :class="{
                  'bg-primary-400 rounded-2xl light': mode == event.mode && map == undefined,
                }"
                nobackground
                @click.capture.prevent.stop="onSelectModeMap({ mode: event.mode })"
              >
                <template v-slot:content>
                  <p class="pt-4 h-full flex flex-col justify-center items-center">
                    {{ $t('option.all-maps') }}
                  </p>
                </template>
              </event-card>
              <event-picture-card
                v-else
                :mode="event.mode"
                :map="event.map"
                :event-id="event.id"
                :active="event.active"
                :class="{
                  'bg-primary-400 rounded-2xl light': mode == event.mode && map == event.map,
                }"
                @click.capture.prevent.stop="onSelectModeMap({ mode: event.mode, map: event.map })"
              ></event-picture-card>
            </template>
          </events-roll>
        </template>
      </b-card>
    </b-lightbox>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { BFakeSelect, BLightbox, BButton } from '@schneefux/klicker/components'
import { EventMetadata } from '~/plugins/klicker.service'
import { useActiveEvents, useAllEvents } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    BFakeSelect,
    BLightbox,
    BButton,
  },
  props: {
    modelValue: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const i18n = useI18n()

    const mode = computed(() => (props.modelValue.mode ?? [])[0])
    const map = computed(() => (props.modelValue.map ?? [])[0])

    const allEvents = useAllEvents()
    const activeNonRankedEvents = useActiveEvents([], { powerplay: ['false'] })
    const activeNonRankedMaps = computed(() => activeNonRankedEvents.value.map(e => e.map))
    const activeNonRankedEventsAvailable = computed(() => activeNonRankedEvents.value.length > 0)
    const activeRankedEvents = useActiveEvents([], { powerplay: ['true'] })
    const activeRankedMaps = computed(() => activeRankedEvents.value.map(e => e.map))
    const activeRankedEventsAvailable = computed(() => activeRankedEvents.value.length > 0)

    const stringArraysEqual = (a1: (string|undefined)[], a2: (string|undefined)[]) => a1.slice().sort().toString() == a2.slice().sort().toString()
    const selectedActiveRankedMaps = computed(() => stringArraysEqual(props.modelValue.map ?? [], activeRankedMaps.value))
    const selectedActiveNonRankedMaps = computed(() => stringArraysEqual(props.modelValue.map ?? [], activeNonRankedMaps.value))

    // events (incl. placeholders) are sorted by events-roll
    const allEventsAndSummaries = computed<EventMetadata[]>(() => {
      const modes = [...new Set(allEvents.value.map(e => e.mode))]
      return (<(EventMetadata & { active: boolean })[]>[]).concat(
        [{
          key: 'all',
          id: '0',
          map: 'all',
          mapTranslated: i18n.t('option.all-maps'),
          mode: 'all',
          modeTranslated: i18n.t('option.all-modes'),
          powerplay: false,
          metrics: {},
          active: false,
        }],
        modes.map(m => ({
          key: `all-mode-${m}`,
          id: '0',
          map: 'all',
          mapTranslated: i18n.t('option.all-maps'),
          mode: m,
          modeTranslated: i18n.t('mode.' + m),
          powerplay: false,
          metrics: {},
          active: false,
        })),
        allEvents.value.map(e => ({
          ...e,
          active: activeRankedEvents.value.some(ee => e.id == ee.id) || activeNonRankedEvents.value.some(ee => e.id == ee.id),
        })),
      )
    })

    const mapNames = computed(() => {
      const maps = props.modelValue.map ?? []
      if (maps[0] == undefined) {
        return undefined
      }

      return maps.map(m => allEvents.value?.find(e => e.map == m)?.mapTranslated ?? m).join(', ')
    })

    const onSelectModeMap = (value: { mode?: string, map?: string }) => {
      props.onInput({
        mode: value.mode != undefined ? [value.mode] : [],
        map: value.map != undefined ? [value.map] : [],
      })
      lightboxOpen.value = false
    }

    const onSelectAllActiveMaps = () => {
      props.onInput({
        mode: [],
        map: activeNonRankedMaps.value,
      })
      lightboxOpen.value = false
    }

    const onSelectAllRankedMaps = () => {
      props.onInput({
        mode: [],
        map: activeRankedMaps.value,
      })
      lightboxOpen.value = false
    }

    const lightboxOpen = ref(false)

    return {
      mode,
      map,
      onSelectModeMap,
      onSelectAllActiveMaps,
      onSelectAllRankedMaps,
      selectedActiveRankedMaps,
      selectedActiveNonRankedMaps,
      activeRankedEventsAvailable,
      activeNonRankedEventsAvailable,
      allEventsAndSummaries,
      lightboxOpen,
      mapNames,
    }
  },
})
</script>
