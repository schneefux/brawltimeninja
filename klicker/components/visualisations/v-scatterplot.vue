<template>
  <v-card-wrapper
    :card="card"
    :loading="loading"
    component="v-scatterplot"
  >
    <template v-slot:content>
      <b-vega
        :spec="spec"
        :show-download="card != undefined"
        full-width
        full-height
      ></b-vega>
    </template>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '../../props'
import { VisualizationSpec } from 'vega-embed'
import BVega from '../ui/b-vega.vue'
import { computed, defineComponent } from 'vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useKlickerConfig } from '../../composables/klicker'

export default defineComponent({
  components: {
    BVega,
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlickerConfig()
    const { $klicker, dimensions, metrics } = useCubeResponseProps(props)

    const spec = computed<VisualizationSpec>(() => {
      const metric0 = metrics.value[0]
      const metric1 = metrics.value[1]
      const dimension0 = dimensions.value[0]

      return {
        data: {
          values: props.response.data,
        },
        encoding: {
          x: {
            ...metric0.vega,
            field: 'metricsRaw.' + metric0.id,
            type: metric0.type,
            title: $klicker.getName(translate, metric0),
            axis: {
              format: metric0.d3formatter,
            },
          },
          y: {
            ...metric1.vega,
            field: 'metricsRaw.' + metric1.id,
            type: metric1.type,
            title: $klicker.getName(translate, metric1),
            axis: {
              format: metric1.d3formatter,
            },
          },
          tooltip: [{
            field: 'metrics.' + metric0.id,
            title: $klicker.getName(translate, metric0),
          }, {
            field: 'metrics.' + metric1.id,
            title: $klicker.getName(translate, metric1),
          }, {
            field: 'dimensions.' + dimension0.id,
            title: $klicker.getName(translate, dimension0),
          }],
        },
        layer: [{
          mark: 'point',
          params: [{
            name: 'grid',
            select: 'interval',
            bind: 'scales',
          }],
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
              title: $klicker.getName(translate, dimension0),
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
