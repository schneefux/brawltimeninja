<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-lineplot"
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
import { computed, defineComponent } from 'vue-demi'
import { VisualizationSpec } from 'vega-embed'
import { VisualisationProps } from '../../props'
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
    const { $klicker, dimensions, metrics, switchResponse, comparing } = useCubeResponseProps(props)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const metric0 = metrics.value[0]

      const values = switchResponse(response => response.data, response => response.data.flatMap(e => [{
        dimensions: e.dimensions,
        metrics: e.metricsRaw,
        metricsRaw: e.metricsRaw,
        metricsCI: e.metricsCI,
        source: response.query.name ?? $klicker.$t('comparison.dataset.test') as string,
        sourceRaw: 'test',
      }, {
        id: e.id,
        dimensions: e.dimensions,
        metrics: e.test.reference.metricsRaw,
        metricsRaw: e.test.reference.metricsRaw,
        metricsCI: e.test.reference.metricsCI,
        source: response.query.reference.name ?? $klicker.$t('comparison.dataset.reference') as string,
        sourceRaw: 'reference',
      }]))

      const withCI = values[0].metricsCI[metric0.id] != undefined

      return {
        data: {
          values,
        },
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: $klicker.getName(dimension0),
            scale: dimension0.scale,
          },
          y: {
            ...metric0.vega,
            field: 'metricsRaw.' + metric0.id,
            type: metric0.type,
            title: $klicker.getName(metric0),
            axis: {
              format: metric0.d3formatter,
            },
          },
          ...(comparing.value ? {
            color: {
              field: 'source',
              legend: {
                title: null,
                offset: 8,
                orient: 'top',
              },
            },
          } : {}),
          // TODO spread breaks types
          tooltip: <any>[{
            field: 'metrics.' + metric0.id,
            title: $klicker.getName(metric0),
          }, {
            field: 'dimensions.' + dimension0.id,
            title: $klicker.getName(dimension0),
          },
          ...(withCI ? [{
            field: 'upper',
            type: 'quantitative',
            title: $klicker.$t('confidence-interval.lower', { percent: 95 }),
          }, {
            field: 'lower',
            type: 'quantitative',
            title: $klicker.$t('confidence-interval.upper', { percent: 95 }),
          } ] : []),
          ],
        },
        ...(withCI ? {
          // workaround for https://stackoverflow.com/questions/67358393/trouble-with-errorband-and-nested-properties
          transform: [{
            calculate: 'datum.metricsCI.' + metric0.id + '.lower',
            as: 'lower',
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.mean',
            as: 'metricsRaw.' + metric0.id,
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.upper',
            as: 'upper',
          }],
        } : {}),
        layer: [{
          mark: 'line',
        },
        ...(withCI ? [{
          mark: 'errorband' as 'errorband',
          encoding: {
            y: {
              field: 'lower',
              type: 'quantitative' as 'quantitative',
            },
            y2: {
              field: 'upper',
            },
            ...(comparing.value ? {
              color: {
                field: 'source',
                legend: null,
              },
            } : {}),
          },
        }] : [])],
        resolve: {
          legend: {
            // https://github.com/vega/vega-lite/issues/6259#issuecomment-609069125
            color: 'independent',
          },
        },
      }
    })

    return {
      spec,
    }
  },
})
</script>
