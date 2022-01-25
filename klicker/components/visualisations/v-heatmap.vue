<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-heatmap"
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
import { VisualisationProps } from '../../props'
import { VisualizationSpec } from 'vega-embed'
import { computed, defineComponent } from 'vue-demi'
import BVega from '../ui/b-vega.vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'

export default defineComponent({
  components: {
    BVega,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, measurements, comparing } = useCubeResponseProps(props)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const dimension1 = dimensions.value[1]
      const measurement0 = measurements.value[0]
      return {
        data: {
          values: props.response.data,
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
          ...(!comparing.value ? {
            color: {
              ...measurement0.vega,
              field: 'measurementsRaw.' + measurement0.id,
              type: measurement0.type,
              title: measurement0.name,
              legend: {
                offset: 8,
                orient: 'top',
              },
            },
          } : {
            color: {
              ...measurement0.vega,
              field: 'test.difference.differenceRaw',
              type: measurement0.type,
              title: $klicker.$t('comparison.difference.to.dataset', { dataset: $klicker.$t('comparison.dataset.reference') as string }) as string,
              legend: {
                offset: 8,
                orient: 'top',
              },
            },
          }),
        },
      }
    })

    return {
      spec,
    }
  },
})
</script>
