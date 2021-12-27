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
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { VisualizationSpec } from 'vega-embed'
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { useCubeResponse } from '~/klicker/composables/response'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    BVega,
    VCardWrapper,
  },
  props: {
    card: {
      type: undefined,
      required: false
    },
    loading: {
      type: Boolean,
      required: true
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()
    const { $klicker, dimensions, measurements, switchResponse, comparing } = useCubeResponse(props)

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]

      const values = switchResponse(response => response.data, response => response.data.flatMap(e => [{
        dimensions: e.dimensions,
        measurements: e.measurementsRaw,
        measurementsRaw: e.measurementsRaw,
        measurementsCI: e.measurementsCI,
        source: response.query.name ?? i18n.t('comparison.dataset.test') as string,
        sourceRaw: 'test',
      }, {
        id: e.id,
        dimensions: e.dimensions,
        measurements: e.test.reference.measurementsRaw,
        measurementsRaw: e.test.reference.measurementsRaw,
        measurementsCI: e.test.reference.measurementsCI,
        source: response.query.reference.name ?? i18n.t('comparison.dataset.reference') as string,
        sourceRaw: 'reference',
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
          },
          y: {
            ...measurement0.vega,
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: $klicker.getName(measurement0),
            axis: {
              format: measurement0.d3formatter,
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
          } ] : []),
          ],
        },
        ...(withCI ? {
          // workaround for https://stackoverflow.com/questions/67358393/trouble-with-errorband-and-nested-properties
          transform: [{
            calculate: 'datum.measurementsCI.' + measurement0.id + '.lower',
            as: 'lower',
          }, {
            calculate: 'datum.measurementsCI.' + measurement0.id + '.mean',
            as: 'measurementsRaw.' + measurement0.id,
          }, {
            calculate: 'datum.measurementsCI.' + measurement0.id + '.upper',
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
