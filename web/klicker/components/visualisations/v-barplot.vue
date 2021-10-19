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
import { Dimension, Measurement } from '~/klicker'
import { MetaGridEntry } from '~/klicker'
import { VisualizationSpec } from 'vega-embed'
import BVega from '~/klicker/components/ui/b-vega.vue'
import BCard from '~/klicker/components/ui/b-card.vue'
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BVega,
    BCard,
  },
  inheritAttrs: false,
  props: {
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
  },
  setup(props) {
    const show = computed(() =>
      props.dimensions.length == 1 && props.dimensions[0].type == 'nominal' && props.measurements.length == 1 && props.data.length > 1 && props.data.length < 100
    )

    const spec = computed<VisualizationSpec>(() => ({
      data: {
        values: props.data,
      },
      mark: 'bar',
      encoding: {
        x: {
          field: 'dimensions.' + props.dimensions[0].id,
          type: props.dimensions[0].type,
          title: props.dimensions[0].name,
          scale: props.dimensions[0].scale,
          sort: {
            field: props.measurements[0].id,
            order: props.measurements[0].sign == -1 ? 'descending' : 'ascending',
          },
        },
        y: {
          field: 'measurementsRaw.' + props.measurements[0].id,
          type: props.measurements[0].type,
          title: props.measurements[0].name,
          axis: {
            format: props.measurements[0].formatter,
          },
          scale: props.measurements[0].scale,
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
