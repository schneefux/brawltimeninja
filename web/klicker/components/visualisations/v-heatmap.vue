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
import { computed, PropType } from '@vue/composition-api'
import { defineComponent, useContext } from '@nuxtjs/composition-api'
import { BVega, BCard } from '~/klicker/components'
import { useCubeResponse } from '~/klicker/composables/response'

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
    const { i18n } = useContext()
    const { dimensions, measurements, comparing, applicable } = useCubeResponse('v-heatmap', props)

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
              title: i18n.t('comparison.difference.to.dataset', { dataset: i18n.t('comparison.dataset.reference') as string }) as string,
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
      applicable,
      spec,
    }
  },
})
</script>
