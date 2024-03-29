<template>
  <v-card-wrapper
    :card="card && { ...card, title: translate('dashboard.export-data') }"
    :loading="loading"
    component="v-csv"
  >
    <template v-slot:actions>
      <b-button
        primary
        sm
        @click="download()"
      >
        {{ translate('action.export-csv') }}
      </b-button>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { VisualisationProps } from '../../props'
import BButton from '../ui/b-button.vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useKlickerConfig } from '../../composables/klicker'

export default defineComponent({
  components: {
    BButton,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlickerConfig()
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const download = () => {
      const header = (<string[]>[]).concat(
        dimensions.value.map(d => $klicker.getName(translate, d)),
        metrics.value.map(m => $klicker.getName(translate, m)),
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

    return {
      translate,
      download,
    }
  },
})
</script>
