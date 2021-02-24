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
      return this.dimensions.length == 2 && this.measurements.length == 1 && this.data.length > 1 && this.data.length < 1000
    },
    chart(): any {
      if (!this.show) {
        return
      }

      const x = [...new Set(this.data.map(e => e.dimensions[this.dimensions[0].id]))]
      const y = [...new Set(this.data.map(e => e.dimensions[this.dimensions[1].id]))]
      console.log(this.data[0].dimensions)
      const z = y.map(yValue => x.map(xValue =>
        this.data.find(d => d.dimensions[this.dimensions[0].id] == xValue && d.dimensions[this.dimensions[1].id] == yValue)
        ?.measurementsRaw[this.measurements[0].id]
      ))

      // heatmap with dimensions on x and y and measurement on color
      return {
        traces: [{
          x,
          y,
          z,
          type: 'heatmap',
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
              text: this.dimensions[1].name,
              standoff: 10,
            },
            fixedrange: true,
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
