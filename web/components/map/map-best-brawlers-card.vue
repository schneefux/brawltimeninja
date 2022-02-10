<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
    full-height
  >
    <div
      v-if="powerplay || endDate != undefined || startDate != undefined"
      slot="infobar"
      class="flex justify-end"
    >
      <span v-if="powerplay">
        {{ $tc('power-play', 1) }}
      </span>
      <span v-else-if="endDate != undefined">
        {{ endDateString }}
      </span>
      <span v-else-if="startDate != undefined">
        {{ startDateString }}
      </span>
    </div>

    <map-best-brawlers
      slot="content"
      :slices="slices"
      :card="{ elevation: 0, dense: true, fullHeight: true }"
    ></map-best-brawlers>
  </event-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, useContext } from '@nuxtjs/composition-api'
import { parseISO, formatDistanceToNow } from 'date-fns'
import { SliceValue } from '@schneefux/klicker/types'

import { enUS, de, es } from 'date-fns/locale'
const locales = { en: enUS, de, es }

export default defineComponent({
  props: {
    endDate: {
      type: String,
      required: false
    },
    startDate: {
      type: String,
      required: false
    },
    id: {
      type: [Number, String],
      required: false
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const mode = computed(() => props.slices.mode?.[0])
    const map = computed(() => props.slices.map?.[0])
    const powerplay = computed(() => props.slices.powerplay?.[0] == 'true')
    const endDateString = computed(() => {
      if (props.endDate == undefined) {
        return ''
      }

      const date = parseISO(props.endDate)
      const dist = formatDistanceToNow(date, {
        locale: locales[i18n.locale],
      })

      return i18n.t('time.ends-in', { time: dist }) as string
    })
    const startDateString = computed(() => {
      if (props.startDate == undefined) {
        return ''
      }

      const date = parseISO(props.startDate)
      return 'starts in ' + formatDistanceToNow(date)
    })

    return {
      mode,
      map,
      powerplay,
      endDateString,
      startDateString,
    }
  },
})
</script>
