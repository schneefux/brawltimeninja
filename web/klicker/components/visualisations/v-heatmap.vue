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
import { computed, PropType, toRefs } from '@vue/composition-api'
import { defineComponent } from '@nuxtjs/composition-api'
import { BVega, BCard } from '~/klicker/components'

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

    const show = computed(() => {
      if (query.value.dimensions.length == 2 && query.value.measurements.length == 1 && query.value.data.length > 1) {
        const uniqueX = new Set(query.value.data.map(d => d.dimensions[query.value.dimensions[0].id])).size
        const uniqueY = new Set(query.value.data.map(d => d.dimensions[query.value.dimensions[1].id])).size

        // less than 50% gaps
        return query.value.data.length > 0.5 * uniqueX * uniqueY
      }
      return false
    })

    const spec = computed((): VisualizationSpec => ({
      data: {
        values: query.value.data,
      },
      mark: 'rect',
      encoding: {
        x: {
          field: 'dimensions.' + query.value.dimensions[0].id,
          type: query.value.dimensions[0].type,
          title: query.value.dimensions[0].name,
          scale: query.value.dimensions[0].scale,
        },
        y: {
          field: 'dimensions.' + query.value.dimensions[1].id,
          type: query.value.dimensions[1].type,
          title: query.value.dimensions[1].name,
          scale: query.value.dimensions[1].scale,
        },
        color: {
          field: 'measurementsRaw.' + query.value.measurements[0].id,
          type: query.value.measurements[0].type,
          title: query.value.measurements[0].name,
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
