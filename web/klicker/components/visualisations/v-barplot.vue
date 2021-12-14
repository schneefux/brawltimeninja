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
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import { LayerSpec } from 'vega-lite/build/src/spec'

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
    const { response } = toRefs(props)
    const { $klicker, i18n } = useContext()

    const dimensions = computed(() => $klicker.getDimensions(response.value.query))
    const measurements = computed(() => $klicker.getMeasurements(response.value.query))

    const show = computed(() =>
      dimensions.value.length == 1 &&
      dimensions.value[0].type == 'nominal' &&
      measurements.value.length == 1 &&
      response.value.data.length > 1 &&
      response.value.data.length < 100
    )

    const spec = computed<VisualizationSpec>(() => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]

      const comparing = response.value.kind == 'comparingResponse'
      const values = comparing ? (<CubeComparingResponse> response.value).data.flatMap(e => [{
        ...e,
        source: i18n.t('comparison.test') as string,
        stars: e.test.difference.pValueStars,
      }, {
        ...e.test.reference,
        source: i18n.t('comparison.reference') as string,
        stars: '',
      }]) : response.value.data

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
            ...(comparing ? {
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
        }, ...(comparing ? [{
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
        }] : []) as any]
      }
    })

    return {
      show,
      spec,
    }
  },
})
</script>
