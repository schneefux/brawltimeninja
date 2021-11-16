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
import BVega from '~/klicker/components/ui/b-vega.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BVega,
    BCard,
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

    const show = computed(() => query.value.dimensions.length == 1
      && query.value.dimensions[0].type == 'nominal'
      && query.value.measurements.length == 1
      && query.value.data.length > 1
      && query.value.data.length < 100
    )

    const spec = computed<VisualizationSpec>(() => ({
      data: {
        values: query.value.data,
      },
      mark: 'bar',
      encoding: {
        x: {
          field: 'dimensions.' + query.value.dimensions[0].id,
          type: query.value.dimensions[0].type,
          title: query.value.dimensions[0].name,
          scale: query.value.dimensions[0].scale,
          sort: {
            field: query.value.measurements[0].id,
            order: query.value.measurements[0].sign == -1 ? 'descending' : 'ascending',
          },
        },
        y: {
          field: 'measurementsRaw.' + query.value.measurements[0].id,
          type: query.value.measurements[0].type,
          title: query.value.measurements[0].name,
          axis: {
            format: query.value.measurements[0].formatter,
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
