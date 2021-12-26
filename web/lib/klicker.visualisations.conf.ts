import { Dimension, Measurement, MetaGridEntry, MetaGridEntryDiff, VisualisationSpec } from "~/klicker"

const visualisations: VisualisationSpec[] = [{
  name: 'Margin of Error',
  component: 'v-moe',
  applicable(dimensions: Dimension[], measurements: Measurement[], size: number, comparing: boolean, data: MetaGridEntry[]|MetaGridEntryDiff[]) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && measurements.some(m => m.id == 'picks') && !comparing
  },
}, {
  name: 'Gini Coefficient',
  component: 'v-gini',
  applicable(dimensions: Dimension[], measurements: Measurement[], size: number, comparing: boolean, data: MetaGridEntry[]|MetaGridEntryDiff[]) {
    return dimensions.length == 1 && dimensions[0].id == 'brawler' && size > 0
      && measurements.some(m => m.id == 'picks') && !comparing
  },
}]

export default visualisations
