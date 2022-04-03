<script lang="ts">
import { defineComponent, PropType, h, computed } from 'vue-demi'
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
      return Object.fromEntries(applicableRenderers.map(r => [r.replacesMetricId, r]))
    })

    return () => {
      if (props.metricId in metricRenderers.value) {
        return [h(metricRenderers.value[props.metricId].import, {
          props: {
            row: props.row,
          },
        })]
      } else {
        // workaround to construct a text VNode
        const text = props.row.metrics[props.metricId]
        const textNode = h('p', text).children![0]
        return textNode
      }
    }
  },
})
</script>