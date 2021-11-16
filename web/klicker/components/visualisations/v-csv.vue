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
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)

    const { $klicker } = useContext()

    const show = computed(() => query.value.data.length > 0)

    const download = () => {
      const header = (<string[]>[]).concat(
        query.value.dimensions.map(d => $klicker.getName(d)),
        query.value.measurements.map(m => $klicker.getName(m)),
      ).join(',')
      const body = query.value.data.map(e =>
        (<(string|number)[]>[]).concat(
          query.value.dimensions.map(d => e.dimensionsRaw[d.id][d.naturalIdAttribute]),
          query.value.measurements.map(m => e.measurementsRaw[m.id]),
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
