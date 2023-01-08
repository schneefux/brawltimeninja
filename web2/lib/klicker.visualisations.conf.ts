import { MetaGridEntry, VisualisationSpec } from "@schneefux/klicker/types"

const visualisations: VisualisationSpec[] = [{
  name: 'Margin of Error',
  component: 'v-moe',
  import: () => import(/* webpackChunkName: "v-custom" */ '~/components/klicker/v-moe.vue'),
  applicable(dimensions, metrics, size, comparing) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && metrics.some(m => m.id == 'picks') && !comparing
  },
  initialDimensions: {
    rows: 2,
    columns: 2,
  },
}, {
  name: 'Gini Coefficient',
  component: 'v-gini',
  import: () => import(/* webpackChunkName: "v-custom" */ '~/components/klicker/v-gini.vue'),
  applicable(dimensions, metrics, size, comparing) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && metrics.some(m => m.id == 'useRate') && !comparing
  },
  initialDimensions: {
    rows: 1,
    columns: 2,
  },
}, {
  name: 'Sample Size',
  component: 'v-sample-size',
  import: () => import(/* webpackChunkName: "v-custom" */ '~/components/klicker/v-sample-size.vue'),
  applicable(dimensions, metrics, size, comparing, data) {
    return !comparing && size > 0 && (<MetaGridEntry>data[0]).metricsRaw.picks != undefined
  },
  initialDimensions: {
    rows: 1,
    columns: 2,
  },
}, {
  name: 'Last Update',
  component: 'v-last-update',
  import: () => import(/* webpackChunkName: "v-custom" */ '~/components/klicker/v-last-update.vue'),
  applicable(dimensions, metrics, size, comparing, data) {
    return !comparing && size > 0 && (<MetaGridEntry>data[0]).metricsRaw.timestamp != undefined
  },
  initialDimensions: {
    rows: 1,
    columns: 2,
  },
}]

export default visualisations
