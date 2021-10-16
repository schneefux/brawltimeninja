// client-only plugin because Plotly.js has a hard dependency on the DOM
import Vue from 'vue'
import Plotly from 'plotly.js/lib/core'
import { BPlotly } from '~/klicker/components'
import PlotlyPie from 'plotly.js/lib/pie'
import PlotlyBar from 'plotly.js/lib/bar'
import PlotlyHeatmap from 'plotly.js/lib/heatmap'
import { Plugin } from '@nuxt/types'

Plotly.register([
  PlotlyPie,
  PlotlyBar,
  PlotlyHeatmap,
])
Vue.component('b-plotly', BPlotly)

const plugin: Plugin = (context, inject) => {
  inject('plotly', Plotly)
}

export default plugin
