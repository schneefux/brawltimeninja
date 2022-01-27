<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-barplot"
  >
    <b-vega
      slot="content"
      :spec="spec"
      :show-download="card != undefined"
      full-width
      full-height
      class="min-h-[8rem] min-w-[12rem]"
    ></b-vega>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '../../props'
import { VisualizationSpec } from 'vega-embed'
import BVega from '../ui/b-vega.vue'
import { computed, defineComponent } from 'vue-demi'
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
    const { $klicker, comparing, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const metric0 = metrics.value[0]

      const values = switchResponse(response => response.data, response => response.data.flatMap(e => [{
        dimensions: e.dimensions,
        metricsRaw: e.metricsRaw,
        metricsCI: e.test.reference.metricsCI,
        source: response.query.name ?? $klicker.$t('comparison.dataset.test') as string,
        stars: e.test.difference.pValueStars,
      }, {
        id: e.id,
        dimensions: e.dimensions,
        metricsRaw: e.test.reference.metricsRaw,
        metricsCI: e.test.reference.metricsCI,
        source: response.query.reference.name ?? $klicker.$t('comparison.dataset.reference') as string,
        stars: '',
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
            sort: {
              field: metric0.id,
              order: metric0.sign == -1 ? 'descending' : 'ascending',
            },
          },
          y: {
            ...metric0.vega,
            field: 'metricsRaw.' + metric0.id,
            type: metric0.type,
            title: metric0.name,
            axis: {
              format: metric0.formatter,
            },
            stack: null,
          },
          tooltip: <any>[{ // TODO spread breaks types
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
          }] : []),
          ],
        },
        ...(withCI ? {
          // workaround for https://stackoverflow.com/questions/67358393/trouble-with-errorband-and-nested-properties
          transform: [{
            calculate: 'datum.metricsCI.' + metric0.id + '.lower',
            as: 'lower',
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.mean',
            as: 'metrics.' + metric0.id,
          }, {
            calculate: 'datum.metricsCI.' + metric0.id + '.upper',
            as: 'upper',
          }],
        } : {}),
        layer: [{
          mark: 'bar',
          encoding: {
            ...(comparing.value ? {
              color: {
                field: 'source',
                legend: {
                  title: null,
                  offset: 8,
                  orient: 'top',
                },
              },
              opacity: {
                value: 0.75,
              },
            } : {}),
          },
        },
        ...(withCI ? [{
          mark: 'errorbar' as 'errorbar',
          encoding: {
            y: {
              ...metric0.vega,
              field: 'lower',
              type: 'quantitative' as 'quantitative',
            },
            y2: {
              field: 'upper',
              title: metric0.name,
            },
          },
        }] : []) as any,
        ...(comparing.value ? [{
          mark: {
            type: 'text',
            align: 'center',
            baseline: 'top',
          },
          encoding: {
            text: {
              field: 'stars',
              type: 'nominal',
            },
          },
        }] : []) as any // FIXME spread breaks types
        ]
      }
    })

    return {
      spec,
    }
  },
})
</script>
