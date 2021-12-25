<template>
  <b-card
    v-if="applicable"
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
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import { VisualizationSpec } from 'vega-embed'
import BVega from '~/klicker/components/ui/b-vega.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  components: {
    BVega,
    BCard,
  },
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()
    const { $klicker, comparing, dimensions, measurements, switchResponse, applicable } = useCubeResponse('v-barplot', props)

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]

      const values = switchResponse(response => response.data, response => response.data.flatMap(e => [{
        dimensions: e.dimensions,
        measurementsRaw: e.measurementsRaw,
        measurementsCI: e.test.reference.measurementsCI,
        source: response.query.name ?? i18n.t('comparison.dataset.test') as string,
        stars: e.test.difference.pValueStars,
      }, {
        id: e.id,
        dimensions: e.dimensions,
        measurementsRaw: e.test.reference.measurementsRaw,
        measurementsCI: e.test.reference.measurementsCI,
        source: response.query.reference.name ?? i18n.t('comparison.dataset.reference') as string,
        stars: '',
      }]))

      const withCI = values[0].measurementsCI[measurement0.id] != undefined

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
              field: measurement0.id,
              order: measurement0.sign == -1 ? 'descending' : 'ascending',
            },
          },
          y: {
            ...measurement0.vega,
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.formatter,
            },
            stack: null,
          },
          tooltip: <any>[{ // TODO spread breaks types
            field: 'measurements.' + measurement0.id,
            title: $klicker.getName(measurement0),
          }, {
            field: 'dimensions.' + dimension0.id,
            title: $klicker.getName(dimension0),
          },
          ...(withCI ? [{
            field: 'upper',
            type: 'quantitative',
            title: i18n.t('confidence-interval.lower', { percent: 95 }),
          }, {
            field: 'lower',
            type: 'quantitative',
            title: i18n.t('confidence-interval.upper', { percent: 95 }),
          }] : []),
          ],
        },
        ...(withCI ? {
          // workaround for https://stackoverflow.com/questions/67358393/trouble-with-errorband-and-nested-properties
          transform: [{
            calculate: 'datum.measurementsCI.' + measurement0.id + '.lower',
            as: 'lower',
          }, {
            calculate: 'datum.measurementsCI.' + measurement0.id + '.mean',
            as: 'measurements.' + measurement0.id,
          }, {
            calculate: 'datum.measurementsCI.' + measurement0.id + '.upper',
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
              ...measurement0.vega,
              field: 'lower',
              type: 'quantitative' as 'quantitative',
            },
            y2: {
              field: 'upper',
              title: measurement0.name,
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
      applicable,
      spec,
    }
  },
})
</script>
