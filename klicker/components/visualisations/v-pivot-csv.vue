<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: translate('dashboard.export-data') }"
    component="v-pivot-csv"
  >
    <b-button
      slot="actions"
      primary
      sm
      @click="download()"
    >
      {{ translate('action.export-bar-chart-race-csv') }}
    </b-button>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import BButton from '../ui/b-button.vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useKlicker } from '../../composables'

export default defineComponent({
  components: {
    BButton,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlicker()
    const { dimensions, metrics } = useCubeResponseProps(props)

    const download = () => {
      const temporal = dimensions.value.filter(d => d.type == 'temporal')[0]
      const nominal = dimensions.value.filter(d => d.type == 'nominal')[0]
      const value = metrics.value[0]

      const allDates = props.response.data.map(r => r.dimensionsRaw[temporal.id][temporal.naturalIdAttribute])
      const dates = [...new Set(allDates)].sort()

      const table: Record<string, number[]> = {}
      for (const row of props.response.data) {
        const keyId = row.dimensionsRaw[nominal.id][nominal.naturalIdAttribute]
        if (!(keyId in table)) {
          table[keyId] = new Array(dates.length)
        }
        const date = row.dimensionsRaw[temporal.id][temporal.naturalIdAttribute]
        const index = dates.indexOf(date)
        table[keyId][index] = row.metricsRaw[value.id] as number
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
      translate,
      download,
    }
  },
})
</script>
