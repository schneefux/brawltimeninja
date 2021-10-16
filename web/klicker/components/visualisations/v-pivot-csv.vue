<template>
  <b-button
    v-if="show"
    slot="content"
    class="my-1"
    secondary
    sm
    @click="download()"
  >
    {{ $t('action.export-bar-chart-race-csv') }}
  </b-button>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'

export default Vue.extend({
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
  },
  computed: {
    show(): boolean {
      return this.data.length > 0
        && this.dimensions.filter(d => d.type == 'temporal').length == 1 && this.dimensions.filter(m => m.type == 'nominal').length == 1
        && this.measurements.length == 1
    }
  },
  methods: {
    download() {
      const temporal = this.dimensions.filter(d => d.type == 'temporal')[0]
      const nominal = this.dimensions.filter(d => d.type == 'nominal')[0]
      const value = this.measurements[0]

      const allDates = this.data.map(r => r.dimensionsRaw[temporal.id][temporal.naturalIdAttribute])
      const dates = [...new Set(allDates)].sort()

      const table: Record<string, number[]> = {}
      for (const row of this.data) {
        const keyId = row.dimensionsRaw[nominal.id][nominal.naturalIdAttribute]
        if (!(keyId in table)) {
          table[keyId] = new Array(dates.length)
        }
        const date = row.dimensionsRaw[temporal.id][temporal.naturalIdAttribute]
        const index = dates.indexOf(date)
        table[keyId][index] = row.measurementsRaw[value.id] as number
      }

      const header = (<string[]>[nominal.name]).concat(dates).join(',')
      const body = Object.entries(table).map(([key, values]) => (key + ',' + values.join(','))).join('\n')

      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(header + '\n' + body)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    },
  },
})
</script>
