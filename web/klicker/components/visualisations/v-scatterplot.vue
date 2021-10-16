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
import BCard from '~/klicker/components/ui/b-card.vue'
import BVega from '~/klicker/components/ui/b-vega.vue'

export default Vue.extend({
  components: {
    BCard,
    BVega,
  },
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
      return this.dimensions.length == 1 && this.measurements.length == 2 && this.data.length > 1 && this.data.length < 1000
    },
    spec(): VisualizationSpec {
      return {
        data: {
          values: this.data,
        },
        encoding: {
          x: {
            field: 'measurementsRaw.' + this.measurements[0].id,
            type: this.measurements[0].type,
            title: this.$klicker.getName(this.measurements[0]),
            axis: {
              format: this.measurements[0].d3formatter,
            },
            scale: this.measurements[0].scale,
          },
          y: {
            field: 'measurementsRaw.' + this.measurements[1].id,
            type: this.measurements[1].type,
            title: this.$klicker.getName(this.measurements[1]),
            axis: {
              format: this.measurements[1].d3formatter,
            },
            scale: this.measurements[1].scale,
          },
        },
        layer: [{
          mark: 'point',
        }, {
          mark: {
            type: 'text',
            align: 'center',
            baseline: 'top',
            dy: 3,
          },
          encoding: {
            text: {
              field: 'dimensions.' + this.dimensions[0].id,
              type: this.dimensions[0].type,
              title: this.$klicker.getName(this.dimensions[0]),
            },
          },
        }],
      }
    },
  },
})
</script>
