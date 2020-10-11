import { differenceInWeeks, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
import { TrophiesRow } from '~/model/Clicker'

export default Vue.extend({
  functional: true,
  props: {
    history: {
      type: Array as PropType<TrophiesRow[]>,
      required: true,
    },
  },
  render(h, { props }) {
    const dates = props.history.map(({ timestamp }) => timestamp as unknown as string).sort()
    const trophies = props.history.map(({ trophies }) => trophies)

    const biweekly = 1000*60*60*24*14
    const monthly = biweekly * 2
    const interval = dates.length > 0 && differenceInWeeks(new Date(), parseISO(dates[0])) > 8 ? monthly : biweekly

    const traces = [{
      x: dates,
      y: trophies,
      mode: 'lines',
      type: 'scatter',
      line: {
        color: '#f2d024',
      },
      marker: {
        color: '#f2d024',
      },
    }]

    const layout = {
      xaxis: {
        fixedrange: true,
        tickcolor: 'rgba(255, 255, 255, 0.75)',
        tickmode: 'linear',
        tick0: '2020-07-12', // season start
        dtick: interval,
        ticklen: 3,
        tickangle: 0,
      },
      yaxis: {
        fixedrange: true,
        tickcolor: 'rgba(255, 255, 255, 0.75)',
        tickmode: 'auto',
        ticklen: 3,
        tickangle: 0,
      },
      margin: { t: 5, l: 50, b: 24, r: 25 },
      staticPlot: true,
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        color: '#ffffff',
      },
      dragmode: false,
    }

    const options = {
      displayModeBar: false,
      responsive: true,
    }

    return <plotly
      traces={traces}
      layout={layout}
      options={options}
      class="h-full"
    ></plotly>
  }
})
