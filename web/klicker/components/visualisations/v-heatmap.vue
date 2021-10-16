<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <b-vega
      slot="content"
      :spec="spec"
      full-width
      full-height
      show-download
    ></b-vega>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'
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
      if (this.dimensions.length == 2 && this.measurements.length == 1 && this.data.length > 1) {
        const uniqueX = new Set(this.data.map(d => d.dimensions[this.dimensions[0].id])).size
        const uniqueY = new Set(this.data.map(d => d.dimensions[this.dimensions[1].id])).size

        // less than 50% gaps
        return this.data.length > 0.5 * uniqueX * uniqueY
      }
      return false
    },
    spec(): VisualizationSpec {
      return {
        data: {
          values: this.data,
        },
        mark: 'rect',
        encoding: {
          x: {
            field: 'dimensions.' + this.dimensions[0].id,
            type: this.dimensions[0].type,
            title: this.dimensions[0].name,
            scale: this.dimensions[0].scale,
          },
          y: {
            field: 'dimensions.' + this.dimensions[1].id,
            type: this.dimensions[1].type,
            title: this.dimensions[1].name,
            scale: this.dimensions[1].scale,
          },
          color: {
            field: 'measurementsRaw.' + this.measurements[0].id,
            type: this.measurements[0].type,
            title: this.measurements[0].name,
            scale: this.measurements[0].scale,
          },
        },
      }
    },
  },
})
</script>
