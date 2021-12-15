<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
  >
    <b-vega
      slot="content"
      :spec="spec"
      show-download
      full-width
      full-height
    ></b-vega>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { VisualizationSpec } from 'vega-embed'
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import BVega from '~/klicker/components/ui/b-vega.vue'

export default defineComponent({
  components: {
    BCard,
    BVega,
  },
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { $klicker, i18n } = useContext()

    const dimensions = computed(() => $klicker.getDimensions(props.response.query))
    const measurements = computed(() => $klicker.getMeasurements(props.response.query))

    const show = computed(() =>
      dimensions.value.length == 1 &&
      dimensions.value[0].type == 'temporal' &&
      measurements.value.length == 1 &&
      props.response.data.length > 1 &&
      props.response.data.length < 1000
    )

    const spec = computed((): VisualizationSpec => {
      const dimension0 = dimensions.value[0]
      const measurement0 = measurements.value[0]

      const comparing = props.response.kind == 'comparingResponse'
      const values = comparing ? (<CubeComparingResponse> props.response).data.flatMap(e => [{
        ...e,
        source: i18n.t('comparison.dataset.test') as string,
      }, {
        ...e.test.reference,
        source: i18n.t('comparison.dataset.reference') as string,
      }]) : props.response.data

      return {
        data: {
          values,
        },
        mark: 'line',
        encoding: {
          x: {
            field: 'dimensions.' + dimension0.id,
            type: dimension0.type,
            title: dimension0.name,
            scale: dimension0.scale,
          },
          y: {
            field: 'measurementsRaw.' + measurement0.id,
            type: measurement0.type,
            title: measurement0.name,
            axis: {
              format: measurement0.d3formatter,
            },
            scale: measurement0.scale,
          },
          ...(comparing ? {
            color: {
              field: 'source',
              legend: {
                title: null,
                offset: 8,
                orient: 'top',
              },
            },
          } : {}),
        }
      }
    })

    return {
      show,
      spec,
    }
  },
})
</script>
