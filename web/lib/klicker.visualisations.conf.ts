import { MetaGridEntry, VisualisationSpec } from "~/klicker"

const visualisations: VisualisationSpec[] = [{
  name: 'Margin of Error',
  component: 'v-moe',
  import: () => import('~/components/klicker/v-moe.vue'),
  applicable(dimensions, measurements, size, comparing) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && measurements.some(m => m.id == 'picks') && !comparing
  },
}, {
  name: 'Gini Coefficient',
  component: 'v-gini',
  import: () => import('~/components/klicker/v-gini.vue'),
  applicable(dimensions, measurements, size, comparing) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && measurements.some(m => m.id == 'useRate') && !comparing
  },
}, {
  name: 'Sample Size',
  component: 'v-sample-size',
  import: () => import('~/components/klicker/v-sample-size.vue'),
  applicable(dimensions, measurements, size, comparing, data) {
    return !comparing && (<MetaGridEntry>data[0]).measurementsRaw.picks != undefined
  },
}, {
  name: 'Last Update',
  component: 'v-last-update',
  import: () => import('~/components/klicker/v-last-update.vue'),
  applicable(dimensions, measurements, size, comparing, data) {
    return !comparing && size > 0 && (<MetaGridEntry>data[0]).measurementsRaw.timestamp != undefined
  },
}]

export default visualisations
