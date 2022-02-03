<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: translate('dashboard.export-data') }"
    component="v-csv"
  >
    <b-button
      slot="actions"
      primary
      sm
      @click="download()"
    >
      {{ translate('action.export-csv') }}
    </b-button>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import BButton from '../ui/b-button.vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'

export default defineComponent({
  components: {
    BButton,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const download = () => {
      const header = (<string[]>[]).concat(
        dimensions.value.map(d => $klicker.getName(d)),
        metrics.value.map(m => $klicker.getName(m)),
      ).join(',')
      const body = props.response.data.map(e =>
        (<(string|number)[]>[]).concat(
          dimensions.value.map(d => e.dimensionsRaw[d.id][d.naturalIdAttribute]),
          metrics.value.map(m => e.metricsRaw[m.id]),
        ).join(',')
      ).join('\n')

      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(header + '\n' + body)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    }

    const translate = (key: string, args?: any) => $klicker.$t(key, args)

    return {
      translate,
      download,
    }
  },
})
</script>
