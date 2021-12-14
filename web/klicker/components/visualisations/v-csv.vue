<template>
  <b-button
    v-if="show"
    slot="content"
    class="my-1"
    secondary
    sm
    @click="download()"
  >
    {{ $t('action.export-csv') }}
  </b-button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { CubeResponse } from '~/klicker'
import BButton from '~/klicker/components/ui/b-button.vue'

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
    const { response } = toRefs(props)

    const { $klicker } = useContext()

    const show = computed(() => response.value.data.length > 0)
    const dimensions = computed(() => $klicker.getDimensions(response.value.query))
    const measurements = computed(() => $klicker.getMeasurements(response.value.query))

    const download = () => {
      const header = (<string[]>[]).concat(
        dimensions.value.map(d => $klicker.getName(d)),
        measurements.value.map(m => $klicker.getName(m)),
      ).join(',')
      const body = response.value.data.map(e =>
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
      show,
      download,
    }
  },
})
</script>
