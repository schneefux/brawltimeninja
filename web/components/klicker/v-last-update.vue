<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    title="Last Update"
    dense
  >
    <p
      slot="content"
      class="text-lg"
    >
      {{ lastUpdate }}
    </p>
  </b-card>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
  computed: {
    show(): boolean {
      return this.data.length > 0 && (this.data[0].meta.timestamp != undefined || this.data[0].measurementsRaw.timestamp != undefined)
    },
    lastUpdate(): string {
      const timestamps = this.data
        .map(d => d.measurementsRaw.timestamp ?? d.meta.timestamp)
        .sort() as unknown as string[] // TODO
      const timestamp = parseISO(timestamps[timestamps.length - 1])
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    },
  },
})
</script>
