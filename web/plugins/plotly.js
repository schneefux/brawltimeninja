// client-only plugin because Plotly.js has a hard dependency on the DOM
import Vue from 'vue'
import Plotly from 'plotly.js/lib/core'
import PlotlyComponent from '~/components/plotly'
import PlotlyPie from 'plotly.js/lib/pie'
import PlotlyBar from 'plotly.js/lib/bar'

Plotly.register([
  PlotlyPie,
  PlotlyBar,
])
Vue.component('plotly', PlotlyComponent)

export default (context, inject) => {
  inject('plotly', Plotly)
}
