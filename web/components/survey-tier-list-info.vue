<template>
  <p
    v-show="sampleSize > 0"
    class="prose dark:prose-invert"
  >{{ $t('tier-list.description', { sampleSize, since, lastUpdate } )}}</p>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { CubeResponse, CubeComparingResponse } from '@schneefux/klicker/types'
import { useFormattedDate, useFormattedDistanceToNow } from '~/composables/date-fns'
import { parseISO } from 'date-fns'

export default defineComponent({
  props: {
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true as true
    },
  },
  setup(props) {
    const sampleSize = computed(() => props.response.data[0].metricsRaw.picks as number)
    const lastUpdate = useFormattedDistanceToNow(
      computed(() => parseISO(props.response.data[0].metricsRaw.timestamp as string)), {
        addSuffix: true,
      })
    const since = useFormattedDate(
      computed(() => parseISO(props.response.query.slices.season[0] as string)),
      'PP'
    )

    return {
      sampleSize,
      since,
      lastUpdate,
    }
  },
})
</script>
