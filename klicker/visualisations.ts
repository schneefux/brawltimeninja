import { MetaGridEntry, VisualisationSpec } from "./types"

const defaultVisualisations: VisualisationSpec[] = [{
  name: 'Bar Chart',
  component: 'v-barplot',
  import: () => import('./components/visualisations/v-barplot.vue'),
  applicable(dimensions, metrics, size) {
    return dimensions.length == 1 &&
      ['ordinal', 'nominal'].includes(dimensions[0].type) &&
      metrics.length == 1 &&
      size > 1 &&
      size < 100
  },
  initialDimensions: {
    rows: 4,
    columns: 5,
  },
  resizable: true,
}, {
  name: 'Tier List',
  component: 'v-tier-list',
  import: () => import('./components/visualisations/v-tier-list.vue'),
  applicable(dimensions, metrics, size) {
    return dimensions.length == 1 && metrics.length == 1 && size > 5 && size < 100
  },
  initialDimensions: {
    rows: 4,
    columns: 6,
  },
}, {
  name: 'Test Info',
  component: 'v-test-info',
  import: () => import('./components/visualisations/v-test-info.vue'),
  applicable(dimensions, metrics, size, comparing) {
    return comparing && metrics[0].statistics?.test != undefined
  },
  initialDimensions: {
    rows: 3,
    columns: 4,
  },
}, {
  name: 'Table',
  component: 'v-table',
  import: () => import('./components/visualisations/v-table.vue'),
  applicable(dimensions, metrics, size, comparing) {
    return size > 0 && (comparing || metrics.length < 5)
  },
  initialDimensions: {
    rows: 5,
    columns: 4,
  },
  props: {
    pageSize: {
      name: 'Page Size',
      component: 'b-input',
      import: () => import('./components/ui/b-number.vue'),
      props: {
        dark: true,
        min: 1,
        max: 20,
      },
    }
  },
}, {
  name: 'Scatter Chart',
  component: 'v-scatterplot',
  import: () => import('./components/visualisations/v-scatterplot.vue'),
  applicable(dimensions, metrics, size) {
    return dimensions.length == 1 && metrics.length == 2 && size > 1 && size < 1000
  },
  resizable: true,
  initialDimensions: {
    rows: 4,
    columns: 5,
  },
}, {
  name: 'Horizontal Cards',
  component: 'v-roll',
  import: () => import('./components/visualisations/v-roll.vue'),
  applicable(dimensions, metrics, size) {
    return dimensions.length == 1 && metrics.length > 0 && size > 0 && size < 10
  },
  initialDimensions: {
    rows: 2,
    columns: 5,
  },
}, {
  name: 'Big Numbers',
  component: 'v-bigstats',
  import: () => import('./components/visualisations/v-bigstats.vue'),
  applicable(dimensions, metrics, size) {
    return size == 1 && metrics.length > 0 && metrics.length < 5
  },
  initialDimensions: {
    rows: 1,
    columns: 3,
  },
}, {
  name: 'Pivot Table CSV Download Button',
  component: 'v-pivot-csv',
  import: () => import('./components/visualisations/v-pivot-csv.vue'),
  applicable(dimensions, metrics, size) {
    return size > 0 && dimensions.filter(d => d.type == 'temporal').length == 1
        && dimensions.filter(m => m.type == 'nominal').length == 1
        && metrics.length == 1
  },
  initialDimensions: {
    rows: 1,
    columns: 2,
  },
}, {
  name: 'Line Plot',
  component: 'v-lineplot',
  import: () => import('./components/visualisations/v-lineplot.vue'),
  applicable(dimensions, metrics, size) {
    return dimensions.length == 1 &&
      ['temporal', 'ordinal'].includes(dimensions[0].type) &&
      metrics.length == 1 && size > 1 && size < 1000
  },
  resizable: true,
  initialDimensions: {
    rows: 4,
    columns: 5,
  },
}, {
  name: 'Metric Info',
  component: 'v-info',
  import: () => import('./components/visualisations/v-info.vue'),
  applicable(dimensions, metrics) {
    return metrics.length == 1
  },
  initialDimensions: {
    rows: 2,
    columns: 3,
  },
}, {
  name: 'Heatmap',
  component: 'v-heatmap',
  import: () => import('./components/visualisations/v-heatmap.vue'),
  applicable(dimensions, metrics, size, comparing, data) {
    if (comparing) {
      return false
    }
    data = data as MetaGridEntry[]
    if (dimensions.length == 2 && metrics.length == 1 && size > 1) {
      const uniqueX = new Set(data.map(d => d.dimensions[dimensions[0].id])).size
      const uniqueY = new Set(data.map(d => d.dimensions[dimensions[1].id])).size

      // less than 50% gaps
      return size > 0.5 * uniqueX * uniqueY
    }
    return false
  },
  resizable: true,
  initialDimensions: {
    rows: 4,
    columns: 5,
  },
}, {
  name: 'Grid',
  component: 'v-grid',
  import: () => import('./components/visualisations/v-grid.vue'),
  applicable(dimensions, metrics) {
    return metrics.length > 1
  },
  initialDimensions: {
    rows: 4,
    columns: 5,
  },
}, {
  name: 'CSV Download Button',
  component: 'v-csv',
  import: () => import('./components/visualisations/v-csv.vue'),
  applicable(dimensions, metrics, size) {
    return size > 0
  },
  initialDimensions: {
    rows: 1,
    columns: 2,
  },
}]

export default defaultVisualisations
