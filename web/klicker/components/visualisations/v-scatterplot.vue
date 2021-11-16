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
import { CubeResponse } from '~/klicker'
import { VisualizationSpec } from 'vega-embed'
import BCard from '~/klicker/components/ui/b-card.vue'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BCard,
    BVega,
  },
  inheritAttrs: false,
  props: {
    query: {
      type: Object as PropType<CubeResponse>,
      required: true
    },
  },
  setup(props) {
    const { query } = toRefs(props)

    const show = computed(() =>
      query.value.dimensions.length == 1
      && query.value.measurements.length == 2
      && query.value.data.length > 1
      && query.value.data.length < 1000
    )

    const { $klicker } = useContext()

    const spec = computed<VisualizationSpec>(() => ({
      data: {
        values: query.value.data,
      },
      encoding: {
        x: {
          field: 'measurementsRaw.' + query.value.measurements[0].id,
          type: query.value.measurements[0].type,
          title: $klicker.getName(query.value.measurements[0]),
          axis: {
            format: query.value.measurements[0].d3formatter,
          },
          scale: query.value.measurements[0].scale,
        },
        y: {
          field: 'measurementsRaw.' + query.value.measurements[1].id,
          type: query.value.measurements[1].type,
          title: $klicker.getName(query.value.measurements[1]),
          axis: {
            format: query.value.measurements[1].d3formatter,
          },
          scale: query.value.measurements[1].scale,
        },
      },
      layer: [{
        mark: 'point',
      }, {
        mark: {
          type: 'text',
          align: 'center',
          baseline: 'top',
          dy: 3,
        },
        encoding: {
          text: {
            field: 'dimensions.' + query.value.dimensions[0].id,
            type: query.value.dimensions[0].type,
            title: $klicker.getName(query.value.dimensions[0]),
          },
        },
      }],
    }))

    return {
      show,
      spec,
    }
  },
})
</script>
