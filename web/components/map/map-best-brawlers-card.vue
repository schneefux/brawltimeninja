<template>
  <event-card
    :mode="mode"
    :map="map"
    :event-id="eventId"
  >
    <template
      v-if="ranked || endDate != undefined || startDate != undefined"
      v-slot:infobar
    >
      <div class="flex justify-end">
        <span v-if="ranked">
          {{ $t('ranked') }}
        </span>
        <time
          v-else-if="endDate != undefined"
          :datetime="endISO"
        >{{ endFormatted }}</time>
        <time
          v-else-if="startDate != undefined"
          :datetime="startISO"
        >{{ startFormatted }}</time>
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
import { parseISO } from 'date-fns'
import { SliceValue } from '@schneefux/klicker/types'
import { useI18n } from 'vue-i18n';
import { useFormattedDistanceToNow } from '~/composables/date-fns';

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
    eventId: {
      type: [Number, String],
      required: false
    },
    ranked: {
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
    const mode = computed(() => props.slices.mode?.[0])
    const map = computed(() => props.slices.map?.[0])
    const endDateTimestamp = computed(() => props.endDate != undefined ? parseISO(props.endDate) : undefined)
    const startDateTimestamp = computed(() => props.startDate != undefined ? parseISO(props.startDate) : undefined)

    const endDateFormatted = useFormattedDistanceToNow(endDateTimestamp, {
      addSuffix: false,
    })
    const endISO = computed(() => endDateTimestamp.value?.toISOString())
    const startDateFormatted = useFormattedDistanceToNow(startDateTimestamp, {
      addSuffix: false,
    })
    const startISO = computed(() => startDateTimestamp.value?.toISOString())

    const endFormatted = computed(() => i18n.t('time.ends-in', {
      time: endDateFormatted.value,
    }))
    const startFormatted = computed(() => i18n.t('time.starts-in', {
      time: startDateFormatted.value,
    }))

    return {
      mode,
      map,
      endFormatted,
      startFormatted,
      endISO,
      startISO,
    }
  },
})
</script>
