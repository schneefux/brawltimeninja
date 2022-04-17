import { DimensionRendererSpec, MetricRendererSpec } from "../types"
import Vue from "vue"

const BrawlerImage = Vue.component('brawler-image', {
  props: ['row', 'captioned'],
  template: `
    <div>
      <img
        :src="'https://media.brawltime.ninja/brawlers/' + row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'"
        width="50"
      >
      <span v-if="captioned">{{ row.dimensions.brawler }}</span>
    </div>
  `,
})

const brawlerRenderer: DimensionRendererSpec = {
  name: 'Brawler',
  component: 'brawler-image',
  import: () => Promise.resolve(BrawlerImage),
  applicable() {
    return true
  },
  replacesDimensionIds: ['brawler'],
}

export const BrawlerRendererHooks = {
  mounted() {
    (<any>window).$klicker.dimensionRenderers.push(brawlerRenderer)
  },
  destroyed() {
    (<any>window).$klicker.dimensionRenderers.pop()
  },
}

const WinRateColors = Vue.component('win-rate', {
  props: ['row', 'captioned'],
  template: `
    <span
      :style="{
        color: row.metricsRaw.winRate < 0.625 ? 'red' : 'green',
      }"
    >{{ row.metrics.winRate }}</span>
  `,
})

const winRateRenderer: MetricRendererSpec = {
  name: 'Win Rate',
  component: 'win-rate',
  import: () => Promise.resolve(WinRateColors),
  applicable() {
    return true
  },
  replacesMetricId: 'winRate',
}

export const WinRateRendererHooks = {
  mounted() {
    (<any>window).$klicker.metricRenderers.push(winRateRenderer)
  },
  destroyed() {
    (<any>window).$klicker.metricRenderers.pop()
  },
}
