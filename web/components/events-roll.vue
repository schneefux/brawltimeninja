<template>
  <div>
    <b-textbox
      v-if="events.length >= 20"
      v-model="nameFilter"
      :placeholder="$tc('map', 1)"
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
          :path="`/modes/${camelToKebab(event.mode)}/icon`"
          size="120"
          clazz="w-8 h-8 object-contain"
        ></media-img>
      </template>
      <template v-slot:item="event">
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
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import { camelToKebab } from '~/lib/util'
import { BScrollingList, BTextbox } from '@schneefux/klicker/components'
import { EventMetadata } from '~/plugins/klicker'
import { getMapName } from '~/composables/map'

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

    const { i18n } = useContext()
    const filteredEvents = computed(() =>
      props.events.filter(e => {
        if (nameFilter.value == '') {
          return true
        }

        const mapName = getMapName(i18n, e.id, e.map) ?? ''
        return mapName.toLowerCase().includes(nameFilter.value.toLowerCase())
      })
      .sort((a, b) => {
        // 'all-all' first
        if (a.key == 'all') {
          return -1
        }
        if (b.key == 'all') {
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
            return getMapName(i18n, a.id, a.map)!.localeCompare(getMapName(i18n, b.id, b.map)!)
          }
        }

        // sort by mode name
        return (i18n.t('mode.' + a.mode) as string).localeCompare(i18n.t('mode.' + b.mode) as string)
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
