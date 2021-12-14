<template>
  <b-vega
    v-if="show"
    :spec="spec"
    full-width
    full-height
  ></b-vega>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { VisualizationSpec } from 'vega-embed'
import { CubeResponse } from '~/klicker'
import BVega from '~/klicker/components/ui/b-vega.vue'

export default defineComponent({
  components: {
    BVega,
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

    const show = computed(() => dimensions.value.length == 1 &&
      dimensions.value[0].type == 'temporal' &&
      measurements.value.length == 1 &&
      query.value.data.length > 1 &&
      query.value.data.length < 1000)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]
      return {
        data: {
          values: query.value.data,
        },
        mark: 'line',
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: dimension0.name,
            scale: dimension0.scale,
          },
          y: {
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.d3formatter,
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
