import Vue, { PropType } from 'vue'
import { BrawlerStatisticsRows } from '~/model/Clicker'

export default Vue.extend({
  functional: true,
  props: {
    brawlerStats: {
      type: Object as PropType<BrawlerStatisticsRows>,
      required: true,
    },
    totalBrawlers: {
      type: Number,
      required: true
    },
  },
  render(h, { props }) {
    const brawlerStats = props.brawlerStats
    const totalBrawlers = props.totalBrawlers

    const trophyranges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]

    const useRates = trophyranges.map(t =>
      brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t)!.picksWeighted
      / brawlerStats.totalByTrophies.find(b => b.trophyrange == t)!.picksWeighted
    )

    const winRates = trophyranges.map(t => brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t)!.winRate)
    const avgTotalWinRate = brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.winRate * e.picks, 0)
      / brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.picks, 0)

    const starRates = trophyranges.map(t => brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t)!.starRate)
    const avgTotalStarRate = brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.starRate * e.picks, 0)
      / brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.picks, 0)

    // defaults
    const trophyGraphLayout = {
      xaxis: {
        title: 'Trophies',
        fixedrange: true,
        tickcolor: '#ffffff',
      },
      yaxis: {
        title: '',
        fixedrange: true,
        tickformat: ',.0%',
        tickcolor: '#ffffff',
      },
      margin: { t: 10, l: 55, b: 65, r: 10 },
      staticPlot: true,
      plot_bgcolor: 'rgba(0, 0, 0, 0)',
      paper_bgcolor: 'rgba(0, 0, 0, 0)',
      font: {
        color: '#ffffff',
      },
      dragmode: false,
    }

    const trophyGraphOptions = {
      displayModeBar: false,
      responsive: true,
    }

    // chart configurations
    const trophiesUseRateChart = {
      traces: [{
        x: trophyranges,
        y: useRates,
        mode: 'lines+markers',
        type: 'scatter',
      }],
      layout: {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Use Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: 1 / totalBrawlers,
          x1: 1000,
          y1: 1 / totalBrawlers,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      },
      options: trophyGraphOptions,
    }

    const trophiesWinRateChart = {
      traces: [{
        x: trophyranges,
        y: winRates,
        mode: 'lines+markers',
        type: 'scatter',
      }],
      layout: {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Win Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: avgTotalWinRate,
          x1: 1000,
          y1: avgTotalWinRate,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      },
      options: trophyGraphOptions,
    }

    const trophiesStarRateChart = {
      traces: [{
        x: trophyranges,
        y: starRates,
        mode: 'lines+markers',
        type: 'scatter',
      }],
      layout: {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Star Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: avgTotalStarRate,
          x1: 1000,
          y1: avgTotalStarRate,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      },
      options: trophyGraphOptions,
    }

    return <div class="md:flex md:flex-wrap md:justify-center">
      <client-only>
        <div class="card-wrapper">
          <plotly
            traces={trophiesUseRateChart.traces}
            layout={trophiesUseRateChart.layout}
            options={trophiesUseRateChart.options}
            class="h-48 card card--dark md:max-w-lg"
          ></plotly>
        </div>

        <div class="card-wrapper">
          <plotly
            traces={trophiesWinRateChart.traces}
            layout={trophiesWinRateChart.layout}
            options={trophiesWinRateChart.options}
            class="h-48 card card--dark md:max-w-lg"
          ></plotly>
        </div>

        <div class="card-wrapper">
          <plotly
            traces={trophiesStarRateChart.traces}
            layout={trophiesStarRateChart.layout}
            options={trophiesStarRateChart.options}
            class="h-48 card card--dark md:max-w-lg"
          ></plotly>
        </div>
      </client-only>
    </div>
  }
})
