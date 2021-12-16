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
    const { comparing, dimensions, measurements, switchResponse } = useCubeResponse(props)

    const show = computed(() =>
      dimensions.value.length == 1 &&
      dimensions.value[0].type == 'nominal' &&
      measurements.value.length == 1 &&
      props.response.data.length > 1 &&
      props.response.data.length < 100
    )

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]

      const values = switchResponse(response => response.data, response => response.data.flatMap(e => [{
        dimensions: e.dimensions,
        measurementsRaw: e.measurementsRaw,
        source: i18n.t('comparison.dataset.test') as string,
        stars: e.test.difference.pValueStars,
      }, {
        id: e.id,
        dimensions: e.dimensions,
        measurementsRaw: e.test.reference.measurementsRaw,
        source: i18n.t('comparison.dataset.reference') as string,
        stars: '',
      }]))

      return {
        data: {
          values,
        },
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: dimension0.name,
            scale: dimension0.scale,
            sort: {
              field: measurement0.id,
              order: measurement0.sign == -1 ? 'descending' : 'ascending',
            },
          },
          y: {
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.formatter,
            },
            scale: measurement0.scale,
            stack: null,
          },
        },
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
        }, ...(comparing.value ? [{
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
        }] : []) as any] // FIXME spread breaks types
      }
    })

    return {
      show,
      spec,
    }
  },
})
</script>
