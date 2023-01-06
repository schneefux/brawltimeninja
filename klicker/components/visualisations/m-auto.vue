<template>
  <component
    v-if="metricRenderer"
    :is="metricRenderer"
    :row="row"
  ></component>
  <template v-else>
    {{ text }}
  </template>
</template>

<script lang="ts">
import { defineComponent, PropType, h, computed } from 'vue'
import { useCubeResponseProps } from '../../composables'
import { ComparingMetaGridEntry, CubeComparingResponse, CubeResponse, MetaGridEntry } from '../../types'

/**
 * Metric renderer
 *
 * Using the provided data and the globally configured metric renderers,
 * render the given metric.
 */
export default defineComponent({
  props: {
    /**
     * The metric to render
     */
    metricId: {
      type: String,
      required: true
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true as true
    },
    row: {
      type: Object as PropType<MetaGridEntry|ComparingMetaGridEntry>,
      required: true
    },
  },
  setup(props) {
    const { $klicker, metrics } = useCubeResponseProps(props)

    const metricRenderers = computed(() => {
      const applicableRenderers = $klicker.metricRenderers.filter(r => r.applicable(metrics.value))
      return applicableRenderers.reduce((rr, r) => ({
        ...rr,
        [r.replacesMetricId]: r,
      }), {})
    })

    const metricRenderer = metricRenderers.value[props.metricId]?.import
    const text = props.row.metrics[props.metricId]

    return {
      metricRenderer,
      text,
    }
  },
})
</script>
