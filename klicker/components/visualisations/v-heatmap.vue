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
import { computed, defineComponent } from 'vue'
import BVega from '../ui/b-vega.vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useKlicker } from '../../composables'

export default defineComponent({
  components: {
    BVega,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlicker()
    const { dimensions, metrics, comparing } = useCubeResponseProps(props)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const dimension1 = dimensions.value[1]
      const metric0 = metrics.value[0]
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
              ...metric0.vega,
              field: 'metricsRaw.' + metric0.id,
              type: metric0.type,
              title: metric0.name,
              legend: {
                offset: 8,
                orient: 'top',
              },
            },
          } : {
            color: {
              ...metric0.vega,
              field: 'test.difference.differenceRaw',
              type: metric0.type,
              title: translate('comparison.difference.to.dataset', { dataset: translate('comparison.dataset.reference') }),
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
