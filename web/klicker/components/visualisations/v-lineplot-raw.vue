<template>
  <b-vega
    v-if="applicable"
    :spec="spec"
    full-width
    full-height
  ></b-vega>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { VisualizationSpec } from 'vega-embed'
import { CubeResponse } from '~/klicker'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  components: {
    BVega,
  },
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { dimensions, measurements, applicable } = useCubeResponse('v-lineplot-raw', props)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]
      return {
        data: {
          values: props.response.data,
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
            ...measurement0.vega,
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.d3formatter,
            },
          },
        },
      }
    })

    return {
      applicable,
      spec,
    }
  },
})
</script>
