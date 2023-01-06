import { defineAsyncComponent } from "vue"
import { DimensionRendererSpec, MetricRendererSpec } from "../types"
import { KlickerServiceMock } from "./klicker.service"

const BrawlerImage = {
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
}

const brawlerRenderer: DimensionRendererSpec = {
  name: 'Brawler',
  component: 'brawler-image',
  import: defineAsyncComponent(() => Promise.resolve(BrawlerImage)),
  applicable() {
    return true
  },
  replacesDimensionIds: ['brawler'],
}

export const BrawlerRendererParameters = {
  $klicker: Object.assign(new KlickerServiceMock(), {
    dimensionRenderers: [brawlerRenderer],
  }),
}

const WinRateColors = {
  props: ['row', 'captioned'],
  template: `
    <span
      :style="{
        color: row.metricsRaw.winRate < 0.625 ? 'red' : 'green',
      }"
    >{{ row.metrics.winRate }}</span>
  `,
}

const winRateRenderer: MetricRendererSpec = {
  name: 'Win Rate',
  component: 'win-rate',
  import: defineAsyncComponent(() => Promise.resolve(WinRateColors)),
  applicable() {
    return true
  },
  replacesMetricId: 'winRate',
}

export const WinRateRendererParameters = {
  $klicker: Object.assign(new KlickerServiceMock(), {
    metricRenderers: [winRateRenderer],
  }),
}
