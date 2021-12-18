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
import BCard from '~/klicker/components/ui/b-card.vue'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { useCubeResponse } from '~/klicker/composables/response'

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
    const { $klicker, dimensions, measurements } = useCubeResponse(props)

    const show = computed(() =>
      dimensions.value.length == 1
      && measurements.value.length == 2
      && props.response.data.length > 1
      && props.response.data.length < 1000)

    const spec = computed<VisualizationSpec>(() => {
      const measurement0 = measurements.value[0]
      const measurement1 = measurements.value[1]
      const dimension0 = dimensions.value[0]

      return {
        data: {
          values: props.response.data,
        },
        encoding: {
          x: {
            ...measurement0.vega,
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: $klicker.getName(measurement0),
            axis: {
              format: measurement0.d3formatter,
            },
          },
          y: {
            ...measurement1.vega,
            field: 'measurementsRaw.' + measurement1.id,
            type: measurement1.type,
            title: $klicker.getName(measurement1),
            axis: {
              format: measurement1.d3formatter,
            },
          },
          tooltip: [{
            field: 'measurements.' + measurement0.id,
            title: $klicker.getName(measurement0),
          }, {
            field: 'measurements.' + measurement1.id,
            title: $klicker.getName(measurement1),
          }, {
            field: 'dimensions.' + dimension0.id,
            title: $klicker.getName(dimension0),
          }],
        },
        layer: [{
          mark: 'point',
        }, {
          mark: {
            type: 'text',
            align: 'center',
            baseline: 'top',
            dy: 3,
          },
          encoding: {
            text: {
              field: 'dimensions.' + dimension0.id,
              type: dimension0.type,
              title: $klicker.getName(dimension0),
            },
          },
        }],
      }
    })

    return {
      show,
      spec,
    }
  },
})
</script>
