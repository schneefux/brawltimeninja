// client-only plugin because Plotly.js has a hard dependency on the DOM
import Vue from 'vue'
import Plotly from 'plotly.js/lib/core'
import PlotlyComponent from '~/components/plotly'
import PlotlyPie from 'plotly.js/lib/pie'
import PlotlyBar from 'plotly.js/lib/bar'
import PlotlyHeatmap from 'plotly.js/lib/heatmap'

Plotly.register([
  PlotlyPie,
  PlotlyBar,
  PlotlyHeatmap,
])
Vue.component('plotly', PlotlyComponent)

export default (context, inject) => {
  inject('plotly', Plotly)
}
