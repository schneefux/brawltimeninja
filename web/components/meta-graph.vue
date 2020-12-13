<template>
  <card v-bind="$attrs">
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
import { metaStatMaps, MetaGridEntry, compare1 } from '../lib/util'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    stat: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
  },
  computed: {
    chart(): any {
      if (this.entries.length == 0 || !(this.stat in this.entries[0].stats)) {
        return undefined
      }

      const entries = this.entries.sort(compare1(this.stat as any))

      return {
        traces: [{
          x: entries.map(e => e.title),
          // fix `calculateDiffs` output by unformatting it
          // TODO: find a better solution
          y: entries.map(e => Number.parseFloat(e.stats[this.stat].toString()) * (e.stats[this.stat].toString().endsWith('%') ? 0.01 : 1)),
          text: entries.map(e => e.title),
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
              text: 'Brawler',
              standoff: 10,
            },
            fixedrange: true,
            tickcolor: '#ffffff',
            automargin: true,
          },
          yaxis: {
            title: {
              text: metaStatMaps.labels[this.stat],
              standoff: 10,
            },
            fixedrange: true,
            tickformat: metaStatMaps.d3formatters[this.stat],
            tickcolor: '#ffffff',
            automargin: true,
          },
        },
      }
    },
  },
})
</script>
