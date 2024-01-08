<template>
  <v-card-wrapper
    :card="card != undefined && { ...card, title: $t('metric.last-update') }"
    :loading="loading"
    value=""
    component="v-last-update"
    wrapper="b-bigstat"
  >
    <template v-slot:content>
      <relative-time :timestamp="lastUpdate" add-suffix></relative-time>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { parseISO } from 'date-fns'
import { VCardWrapper } from '@schneefux/klicker/components'
import { VisualisationProps } from '@schneefux/klicker/props'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const lastUpdate = computed(() => {
      const timestamps = props.response.data
        .map(d => d.metricsRaw.timestamp)
        .sort() as unknown as string[] // TODO

      // TODO fix types - fix null checks
      if (timestamps.length == 0) {
        return undefined
      }
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (isNaN(timestamp.valueOf()) || timestamp.valueOf() == 0) {
        return undefined
      }

      return timestamp
    })

    return {
      lastUpdate,
    }
  },
})
</script>
