<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-scatterplot"
  >
    <b-vega
      slot="content"
      :spec="spec"
      :show-download="card != undefined"
      full-width
      full-height
    ></b-vega>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '~/klicker/props'
import { VisualizationSpec } from 'vega-embed'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { useCubeResponseProps } from '~/klicker/composables/response'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    BVega,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, measurements } = useCubeResponseProps(props)

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
      spec,
    }
  },
})
</script>
