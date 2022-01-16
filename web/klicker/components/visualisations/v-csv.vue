<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: 'Download the data', dense: true }"
    component="v-csv"
  >
    <b-button
      slot="content"
      class="my-1"
      secondary
      sm
      @click="download()"
    >
      {{ $t('action.export-csv') }}
    </b-button>
  </v-card-wrapper>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { VisualisationProps } from '~/klicker/props'
import BButton from '~/klicker/components/ui/b-button.vue'
import { useCubeResponse } from '~/klicker/composables/response'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    BButton,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, measurements } = useCubeResponse(props)

    const download = () => {
      const header = (<string[]>[]).concat(
        dimensions.value.map(d => $klicker.getName(d)),
        measurements.value.map(m => $klicker.getName(m)),
      ).join(',')
      const body = props.response.data.map(e =>
        (<(string|number)[]>[]).concat(
          dimensions.value.map(d => e.dimensionsRaw[d.id][d.naturalIdAttribute]),
          measurements.value.map(m => e.measurementsRaw[m.id]),
        ).join(',')
      ).join('\n')

      const downloader = document.createElement('a')
      downloader.href = 'data:text/csv;charset=utf-8,' + encodeURI(header + '\n' + body)
      downloader.target = '_blank'
      downloader.download = 'export.csv'
      downloader.click()
    }

    return {
      download,
    }
  },
})
</script>
