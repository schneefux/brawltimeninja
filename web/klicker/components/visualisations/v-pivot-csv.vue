<template>
  <b-button
    v-if="applicable"
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
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  components: {
    BButton,
  },
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { dimensions, measurements, applicable } = useCubeResponse('v-pivot-csv', props)

    const download = () => {
      const temporal = dimensions.value.filter(d => d.type == 'temporal')[0]
      const nominal = dimensions.value.filter(d => d.type == 'nominal')[0]
      const value = measurements.value[0]

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
      applicable,
      download,
    }
  },
})
</script>
