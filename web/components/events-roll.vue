<template>
  <div>
    <b-textbox
      v-if="events.length >= 20"
      v-model="nameFilter"
      :placeholder="$t('map', 1)"
      class="mt-8"
    ></b-textbox>

    <b-scrolling-list
      :items="filteredEvents"
      :cell-rows="withData ? 2 : 3"
      :cell-columns="withData ? 3 : 2"
      :render-at-least="withData ? 3 : 5"
      :preview-indices="firstForModeIndices"
      key-id="key"
      class="mt-8"
      render-placeholder
    >
      <template
        v-if="firstForModeIndices.length > 2"
        v-slot:preview="event"
      >
        <button
          v-if="event.mode == 'all'"
          class="min-w-8 h-8"
        >{{ $t('option.all') }}</button>
        <media-img
          v-else
          :path="event.icon"
          size="120"
          clazz="w-8 h-8 object-contain"
        ></media-img>
      </template>
      <template v-slot:item="event">
        <slot :event="event">
          <map-best-brawlers-card
            v-if="withData"
            :slices="event.slices"
            :ranked="event.powerplay"
            :event-id="event.id"
            :start-date="event.start"
            :end-date="event.end"
          ></map-best-brawlers-card>
          <event-picture-card
            v-else
            :mode="event.mode"
            :map="event.map"
            :event-id="event.id"
          ></event-picture-card>
        </slot>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import { camelToKebab } from '~/lib/util'
import { BScrollingList, BTextbox } from '@schneefux/klicker/components'
import { EventMetadata } from '~/plugins/klicker.service'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    BScrollingList,
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
    modeFilterDefault: {
      type: String,
      default: 'all'
    },
  },
  setup(props) {
    const nameFilter = ref('')

    const i18n = useI18n()
    const filteredEvents = computed(() => props.events
      .map(e => ({
        ...e,
        slices: {
          mode: [e.mode],
          map: [e.map],
        },
        icon: `/modes/${camelToKebab(e.mode)}/icon`,
      }))
      .filter(e => {
        if (nameFilter.value == '') {
          return true
        }

        return e.mapTranslated.toLowerCase().includes(nameFilter.value.toLowerCase())
      })
      .sort((a, b) => {
        // 'all-all' first
        if (a.mode == 'all') {
          return -1
        }
        if (b.mode == 'all') {
          return +1
        }

        // 'all' first for mode
        if (a.mode == b.mode) {
          if (a.key.startsWith('all-')) {
            return -1
          }
          if (b.key.startsWith('all-')) {
            return +1
          }
          if (a.mode == b.mode) {
            // same mode: sort by map name
            return a.mapTranslated.localeCompare(b.mapTranslated, i18n.locale.value)
          }
        }

        // sort by mode name
        return a.modeTranslated.localeCompare(b.modeTranslated, i18n.locale.value)
      })
    )

    const firstForModeIndices = computed(() => {
      return filteredEvents.value
        .map((event, index, all) => ({
          first: index == all.findIndex(e2 => event.mode == e2.mode),
          index,
        }))
        .filter(({ first }) => first)
        .map(({ index }) => index)
    })

    return {
      nameFilter,
      camelToKebab,
      filteredEvents,
      firstForModeIndices,
    }
  },
})
</script>
