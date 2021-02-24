<template>
  <card
    v-if="show"
    v-bind="$attrs"
    size="w-80"
  >
    <plotly
      slot="content"
      v-if="chart != undefined"
      :traces="chart.traces"
      :layout="chart.layout"
      :options="chart.options"
      class="h-full"
    ></plotly>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'

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
      return this.dimensions.length == 1 && this.measurements.length == 1 && this.data.length > 1 && this.data.length < 100
    },
    chart(): any {
      if (!this.show) {
        return
      }

      // bar plot with dimension on x and label and measurement on y
      return {
        traces: [{
          x: this.data.map(e => e.dimensions[this.dimensions[0].id]),
          y: this.data.map(e => e.measurementsRaw[this.measurements[0].id]),
          text: this.data.map(e => e.dimensions[this.dimensions[0].id]),
          marker: {
            color: '#facc15' // yellow-400
          },
          type: 'bar',
        }],
        layout: {
          margin: { t: 0, l: 0, b: 0, r: 0 },
          showlegend: false,
          xaxis: {
            title: {
              text: this.dimensions[0].name,
              standoff: 10,
            },
            fixedrange: true,
            tickcolor: '#ffffff',
            automargin: true,
          },
          yaxis: {
            title: {
              text: this.measurements[0].name,
              standoff: 10,
            },
            fixedrange: true,
            tickformat: this.measurements[0].d3formatter,
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
