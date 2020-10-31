<template>
  <div class="container">
    <div class="section card card--dark px-3 py-2">
      <client-only>
        <plotly
          :traces="chart.traces"
          :layout="chart.layout"
          :options="chart.options"
          class="h-64"
        ></plotly>
      </client-only>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, compare1 } from '../lib/util'

const trophyGraphLayout = {
  margin: { t: 10, l: 50, b: 80, r: 10 },
  plot_bgcolor: 'rgba(0, 0, 0, 0)',
  paper_bgcolor: 'rgba(0, 0, 0, 0)',
  font: {
    color: '#ffffff',
  },
  dragmode: false,
  showlegend: false,
}

export default Vue.extend({
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
      const entries = this.entries.sort(compare1(this.stat))

      return {
        traces: [{
          x: entries.map(e => e.title),
          y: entries.map(e => e.stats[this.stat]),
          mode: 'lines+markers',
          type: 'scatter',
        }],
        layout: {
          ...trophyGraphLayout,
          xaxis: {
            title: 'Brawler',
            fixedrange: true,
            tickcolor: '#ffffff',
          },
          yaxis: {
            title: metaStatMaps.labels[this.stat],
            fixedrange: true,
            tickformat: metaStatMaps.formatters[this.stat],
            tickcolor: '#ffffff',
          },
        },
        options: {
          displayModeBar: false,
          responsive: true,
        },
      }
    },
  },
})
</script>
