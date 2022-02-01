<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: $t('metric.last-update') }"
    :value="lastUpdate"
    component="v-last-update"
    wrapper="b-bigstat"
  >
    <p slot="content">
      {{ lastUpdate }}
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { formatDistanceToNow, parseISO } from 'date-fns'
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
    const lastUpdate = computed((): string => {
      const timestamps = props.response.data
        .map(d => d.metricsRaw.timestamp)
        .sort() as unknown as string[] // TODO
      // TODO fix types - fix null checks
      if (timestamps.length == 0) {
        return 'never'
      }
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (isNaN(timestamp.valueOf()) || timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    })

    return {
      lastUpdate,
    }
  },
})
</script>
