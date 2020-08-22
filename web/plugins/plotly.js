// client-only plugin because Plotly.js has a hard dependency on the DOM
import Vue from 'vue'
import Plotly from 'plotly.js/lib/core'
import PlotlyComponent from '~/components/plotly'

Plotly.register([])
Vue.component('plotly', PlotlyComponent)

export default (context, inject) => {
  inject('plotly', Plotly)
}
