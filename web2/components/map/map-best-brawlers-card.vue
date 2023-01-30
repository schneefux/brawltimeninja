<template>
  <event-card
    :mode="mode"
    :map="map"
    :id="id"
  >
    <template
      v-if="powerplay || endDate != undefined || startDate != undefined"
      v-slot:infobar
    >
      <div class="flex justify-end">
        <span v-if="powerplay">
          {{ $t('power-play') }}
        </span>
        <span v-else-if="endDate != undefined">
          {{ endDateString }}
        </span>
        <span v-else-if="startDate != undefined">
          {{ startDateString }}
        </span>
      </div>
    </template>

    <template v-slot:content>
      <map-best-brawlers
        :slices="slices"
        :card="{ elevation: 0, dense: true }"
      ></map-best-brawlers>
    </template>
  </event-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { parseISO, formatDistanceToNow } from 'date-fns'
import { SliceValue } from '@schneefux/klicker/types'
import { useDateFnLocale } from '~/composables/date-fns'
import { useI18n } from 'vue-i18n'

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
    powerplay: {
      type: Boolean,
      default: false
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const i18n = useI18n()
    const { locale } = useDateFnLocale()

    const mode = computed(() => props.slices.mode?.[0])
    const map = computed(() => props.slices.map?.[0])
    const endDateString = computed(() => {
      if (props.endDate == undefined) {
        return ''
      }

      const date = parseISO(props.endDate)
      const dist = formatDistanceToNow(date, {
        locale: locale.value,
      })

      return i18n.t('time.ends-in', { time: dist })
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
      endDateString,
      startDateString,
    }
  },
})
</script>
