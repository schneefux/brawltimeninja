<template>
  <b-button
    class="my-1"
    secondary
    sm
    @click="download()"
  >
    {{ $t('action.export-csv') }}
  </b-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
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
