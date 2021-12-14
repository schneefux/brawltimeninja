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
import { computed, PropType, toRefs } from '@vue/composition-api'
import { defineComponent, useContext } from '@nuxtjs/composition-api'
import { BVega, BCard } from '~/klicker/components'

export default defineComponent({
  components: {
    BCard,
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
    const { response } = toRefs(props)
    const { $klicker } = useContext()

    const dimensions = computed(() => $klicker.getDimensions(response.value.query))
    const measurements = computed(() => $klicker.getMeasurements(response.value.query))

    const show = computed(() => {
      if (dimensions.value.length == 2 && measurements.value.length == 1 && response.value.data.length > 1) {
        const uniqueX = new Set(response.value.data.map(d => d.dimensions[dimensions.value[0].id])).size
        const uniqueY = new Set(response.value.data.map(d => d.dimensions[dimensions.value[1].id])).size

        // less than 50% gaps
        return response.value.data.length > 0.5 * uniqueX * uniqueY
      }
      return false
    })

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const dimension1 = dimensions.value[1]
      const measurement0 = measurements.value[0]
      return {
        data: {
          values: response.value.data,
        },
        mark: 'rect',
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: dimension0.name,
            scale: dimension0.scale,
          },
          y: {
            field: 'dimensions.' + dimension1.id,
            type: dimension1.type,
            title: dimension1.name,
            scale: dimension1.scale,
          },
          color: {
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
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
