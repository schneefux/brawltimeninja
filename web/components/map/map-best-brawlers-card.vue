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
        <i18n-t
          v-else-if="endDate != undefined"
          keypath="time.ends-in"
          scope="global"
          tag="span"
        >
          <template v-slot:time>
            <relative-time :timestamp="endDateTimestamp"></relative-time>
          </template>
        </i18n-t>
        <i18n-t
          v-else-if="endDate != undefined"
          keypath="time.starts-in"
          scope="global"
          tag="span"
        >
          <template v-slot:time>
            <relative-time :timestamp="startDateTimestamp"></relative-time>
          </template>
        </i18n-t>
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
    const mode = computed(() => props.slices.mode?.[0])
    const map = computed(() => props.slices.map?.[0])
    const endDateTimestamp = computed(() => props.endDate != undefined ? parseISO(props.endDate) : undefined)
    const startDateTimestamp = computed(() => props.startDate != undefined ? parseISO(props.startDate) : undefined)

    return {
      mode,
      map,
      endDateTimestamp,
      startDateTimestamp,
    }
  },
})
</script>
