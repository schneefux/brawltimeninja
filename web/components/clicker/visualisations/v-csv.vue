<template>
  <card v-bind="$attrs">
    <b-button
      slot="content"
      secondary
      sm
      @click="download()"
    >
      Export CSV
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'
import { Column } from '@/components/ui/b-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    link: {
      type: [String, Object]
    },
  },
  methods: {
    download() {
      const header = (<string[]>[]).concat(
        this.dimensions.map(d => d.name),
        this.measurements.map(m => m.name),
      ).join(',')
      const body = this.data.map(e =>
        (<(string|number)[]>[]).concat(
          this.dimensions.map(d => e.dimensionsRaw[d.id][d.column]),
          this.measurements.map(m => e.measurementsRaw[m.id]),
        ).join(',')
      ).join('\n')

      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(header + '\n' + body)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    },
  },
})
</script>
