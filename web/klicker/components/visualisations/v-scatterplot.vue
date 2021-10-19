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
import { Dimension, Measurement, MetaGridEntry } from '~/klicker'
import { VisualizationSpec } from 'vega-embed'
import BCard from '~/klicker/components/ui/b-card.vue'
import BVega from '~/klicker/components/ui/b-vega.vue'
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BCard,
    BVega,
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
      props.dimensions.length == 1 && props.measurements.length == 2 && props.data.length > 1 && props.data.length < 1000
    )

    const { $klicker } = useContext()

    const spec = computed<VisualizationSpec>(() => ({
      data: {
        values: props.data,
      },
      encoding: {
        x: {
          field: 'measurementsRaw.' + props.measurements[0].id,
          type: props.measurements[0].type,
          title: $klicker.getName(props.measurements[0]),
          axis: {
            format: props.measurements[0].d3formatter,
          },
          scale: props.measurements[0].scale,
        },
        y: {
          field: 'measurementsRaw.' + props.measurements[1].id,
          type: props.measurements[1].type,
          title: $klicker.getName(props.measurements[1]),
          axis: {
            format: props.measurements[1].d3formatter,
          },
          scale: props.measurements[1].scale,
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
            field: 'dimensions.' + props.dimensions[0].id,
            type: props.dimensions[0].type,
            title: $klicker.getName(props.dimensions[0]),
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
