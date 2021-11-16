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
import { defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)
    const show = () => query.value.data.length > 0
        && query.value.dimensions.filter(d => d.type == 'temporal').length == 1
        && query.value.dimensions.filter(m => m.type == 'nominal').length == 1
        && query.value.measurements.length == 1

    const download = () => {
      const temporal = query.value.dimensions.filter(d => d.type == 'temporal')[0]
      const nominal = query.value.dimensions.filter(d => d.type == 'nominal')[0]
      const value = query.value.measurements[0]

      const allDates = query.value.data.map(r => r.dimensionsRaw[temporal.id][temporal.naturalIdAttribute])
      const dates = [...new Set(allDates)].sort()

      const table: Record<string, number[]> = {}
      for (const row of query.value.data) {
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
    }

    return {
      show,
      download,
    }
  },
})
</script>
