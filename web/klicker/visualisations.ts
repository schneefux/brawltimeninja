import { VisualisationSpec } from "."

const defaultVisualisations: VisualisationSpec[] = [{
  name: 'Bar Chart',
  component: 'v-barplot',
  applicable(dimensions, measurements, size) {
    return dimensions.length == 1 &&
      ['ordinal', 'nominal'].includes(dimensions[0].type) &&
      measurements.length == 1 &&
      size > 1 &&
      size < 100
  },
  canvas: {
    resizable: true,
    initialDimensions: {
      height: 200,
      width: 200,
    },
  },
}, {
  name: 'Tier List',
  component: 'v-tier-list',
  applicable(dimensions, measurements, size) {
    return dimensions.length == 1 && measurements.length == 1 && size > 5 && size < 100
  },
}, {
  name: 'Test Info',
  component: 'v-test-info',
  applicable(dimensions, measurements, size, comparing) {
    return comparing && measurements[0].statistics?.test != undefined
  }
}, {
  name: 'Table',
  component: 'v-table',
  applicable(dimensions, measurements, size, comparing) {
    return comparing || measurements.length < 5
  },
}, {
  name: 'Scatter Chart',
  component: 'v-scatterplot',
  applicable(dimensions, measurements, size) {
    return dimensions.length == 1 && measurements.length == 2 && size > 1 && size < 1000
  },
  canvas: {
    resizable: true,
    initialDimensions: {
      height: 200,
      width: 200,
    },
  },
}, {
  name: 'Horizontal Cards',
  component: 'v-roll',
  applicable(dimensions, measurements, size) {
    return dimensions.length == 1 && measurements.length == 1 && size > 0 && size < 10
  },
}, {
  name: 'Pivot Table CSV Download',
  component: 'v-pivot-csv',
  applicable(dimensions, measurements, size) {
    return size > 0 && dimensions.filter(d => d.type == 'temporal').length == 1
        && dimensions.filter(m => m.type == 'nominal').length == 1
        && measurements.length == 1
  },
}, {
  name: 'Line Plot',
  component: 'v-lineplot',
  applicable(dimensions, measurements, size) {
    return dimensions.length == 1 &&
      ['temporal', 'ordinal'].includes(dimensions[0].type) &&
      measurements.length == 1 && size > 1 && size < 1000
  },
  canvas: {
    resizable: true,
    initialDimensions: {
      height: 200,
      width: 200,
    },
  },
}, {
  name: 'Measurement Info',
  component: 'v-info',
  applicable(dimensions, measurements) {
    return measurements.length == 1
  },
}, {
  name: 'Heatmap',
  component: 'v-heatmap',
  applicable(dimensions, measurements, size, comparing, data) {
    if (dimensions.length == 2 && measurements.length == 1 && size > 1) {
      const uniqueX = new Set(data.map(d => d.dimensions[dimensions[0].id])).size
      const uniqueY = new Set(data.map(d => d.dimensions[dimensions[1].id])).size

      // less than 50% gaps
      return size > 0.5 * uniqueX * uniqueY
    }
    return false
  },
  canvas: {
    resizable: true,
    initialDimensions: {
      height: 200,
      width: 200,
    },
  },
}, {
  name: 'Grid',
  component: 'v-grid',
  applicable(dimensions, measurements) {
    return measurements.length > 1
  },
}, {
  name: 'CSV Download',
  component: 'v-csv',
  applicable(dimensions, measurements, size) {
    return size > 0
  },
}]

export default defaultVisualisations
