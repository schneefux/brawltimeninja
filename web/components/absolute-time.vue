<template>
  <component
    v-if="tag"
    :is="tag"
    :datetime="absoluteISO"
  >
    {{ absoluteFormatted }}
  </component>
  <template v-else>
    {{ absoluteFormatted }}
  </template>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useFormattedDate } from '~/composables/date-fns'
import { parseISO } from 'date-fns'

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'time',
    },
    timestamp: {
      type: [Date, String],
      required: true
    },
    formatStr: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const timestampDate = computed(() => typeof props.timestamp == 'string' ? parseISO(props.timestamp) : props.timestamp)
    const absoluteFormatted = useFormattedDate(
      timestampDate,
      computed(() => props.formatStr)
    )

    const absoluteISO = computed(() => timestampDate.value.toISOString())

    return {
      absoluteFormatted,
      absoluteISO,
    }
  },
})
</script>
