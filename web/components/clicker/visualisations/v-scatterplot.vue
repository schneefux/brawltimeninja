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
      return this.dimensions.length == 1 && this.measurements.length == 2 && this.data.length > 1 && this.data.length < 1000
    },
    chart(): any {
      if (!this.show) {
        return
      }

      // scatter plot with measurements on x and y and dimension on label
      return {
        traces: [{
          x: this.data.map(e => e.measurementsRaw[this.measurements[0].id]),
          y: this.data.map(e => e.measurementsRaw[this.measurements[1].id]),
          text: this.data.map(e => e.dimensions[this.dimensions[0].id]),
          textposition: 'bottom center',
          marker: {
            color: '#facc15' // yellow-400
          },
          type: 'scatter',
          mode: 'markers+text',
        }],
        layout: {
          margin: { t: 0, l: 0, b: 0, r: 0 },
          showlegend: false,
          xaxis: {
            title: {
              text: this.measurements[0].name,
              standoff: 10,
            },
            fixedrange: true,
            tickformat: this.measurements[0].d3formatter,
            tickcolor: '#ffffff',
            automargin: true,
          },
          yaxis: {
            title: {
              text: this.measurements[1].name,
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
