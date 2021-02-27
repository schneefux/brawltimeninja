<template>
  <card
    v-if="show"
    v-bind="$attrs"
  >
    <vega
      slot="content"
      :spec="spec"
      full-width
      full-height
      show-download
    ></vega>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'
import { VisualizationSpec } from 'vega-embed'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
  },
  computed: {
    show(): boolean {
      return this.dimensions.length == 1 && this.dimensions[0].type == 'temporal' && this.measurements.length == 1 && this.data.length > 1 && this.data.length < 1000
    },
    spec(): VisualizationSpec {
      return {
        data: {
          values: this.data,
        },
        mark: 'line',
        encoding: {
          x: {
            field: 'dimensions.' + this.dimensions[0].id,
            type: this.dimensions[0].type,
            title: this.dimensions[0].name,
            scale: this.dimensions[0].scale,
          },
          y: {
            field: 'measurementsRaw.' + this.measurements[0].id,
            type: this.measurements[0].type,
            title: this.measurements[0].name,
            axis: {
              format: this.measurements[0].d3formatter,
            },
            scale: this.measurements[0].scale,
          },
        },
      }
    },
  },
})
</script>
