<template>
  <b-vega
    v-if="show"
    :spec="spec"
    full-width
    full-height
  ></b-vega>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import { VisualizationSpec } from 'vega-embed'
import { CubeResponse } from '~/klicker'
import BVega from '~/klicker/components/ui/b-vega.vue'

export default defineComponent({
  components: {
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
    const show = computed(() => query.value.dimensions.length == 1 &&
      query.value.dimensions[0].type == 'temporal' &&
      query.value.measurements.length == 1 &&
      query.value.data.length > 1 &&
      query.value.data.length < 1000)

    const spec = computed((): VisualizationSpec => ({
      data: {
        values: query.value.data,
      },
      mark: 'line',
      encoding: {
        x: {
          field: 'dimensions.' + query.value.dimensions[0].id,
          type: query.value.dimensions[0].type,
          title: query.value.dimensions[0].name,
          scale: query.value.dimensions[0].scale,
        },
        y: {
          field: 'measurementsRaw.' + query.value.measurements[0].id,
          type: query.value.measurements[0].type,
          title: query.value.measurements[0].name,
          axis: {
            format: query.value.measurements[0].d3formatter,
          },
          scale: query.value.measurements[0].scale,
        },
      },
    }))

    return {
      show,
      spec,
    }
  },
})
</script>
