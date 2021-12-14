<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <b-vega
      slot="content"
      :spec="spec"
      full-width
      full-height
      show-download
    ></b-vega>
  </b-card>
</template>

<script lang="ts">
import { CubeResponse } from '~/klicker'
import { VisualizationSpec } from 'vega-embed'
import BVega from '~/klicker/components/ui/b-vega.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BVega,
    BCard,
  },
  inheritAttrs: false,
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)
    const { $klicker } = useContext()

    const dimensions = computed(() => $klicker.getDimensions(query.value.state))
    const measurements = computed(() => $klicker.getMeasurements(query.value.state))

    const show = computed(() => dimensions.value.length == 1
      && dimensions.value[0].type == 'nominal'
      && measurements.value.length == 1
      && query.value.data.length > 1
      && query.value.data.length < 100
    )

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]
      return {
        data: {
          values: query.value.data,
        },
        mark: 'bar',
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: dimension0.name,
            scale: dimension0.scale,
            sort: {
              field: measurement0.id,
              order: measurement0.sign == -1 ? 'descending' : 'ascending',
            },
          },
          y: {
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.formatter,
            },
            scale: measurement0.scale,
          },
        },
      }
    })

    return {
      show,
      spec,
    }
  },
})
</script>
