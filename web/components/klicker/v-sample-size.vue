<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    title="Sample Size"
    size="w-32"
    dense
  >
    <p
      v-if="sample == 0"
      slot="content"
      class="text-red-400"
    >
      No data!
      Select a different filter.
    </p>
    <p
      v-else
      slot="content"
      class="text-lg"
    >
      {{ sampleFormatted }} Battles
    </p>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'
import { formatSI } from '~/lib/util'

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
      return this.data.length > 0 && (this.data[0].meta.picks != undefined || this.data[0].measurementsRaw.picks != undefined)
    },
    sample(): number {
      return this.data.reduce((agg, e) => agg + parseInt((e.measurementsRaw.picks ?? e.meta.picks) as string), 0)
    },
    sampleFormatted(): string {
      return formatSI(this.sample, 2)
    },
  },
})
</script>
