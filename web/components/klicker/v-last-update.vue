<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: $t('metric.last-update'), dense: true }"
    component="v-last-update"
  >
    <p
      slot="content"
      class="text-lg md:text-xl"
    >
      {{ lastUpdate }}
    </p>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { VCardWrapper } from '~/klicker/components'
import { VisualisationProps } from '~/klicker/props'

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
        .map(d => d.measurementsRaw.timestamp)
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
