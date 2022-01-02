import { defineComponent, h, computed } from '@nuxtjs/composition-api'
import { VNode } from 'vue'
import { VisualisationProps } from '~/klicker'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  props: {
    ...VisualisationProps,
    component: {
      type: String,
      required: true
    },
  },
  setup(props, { slots }) {
    const { $klicker, dimensions, measurements, comparing } = useCubeResponse(props)

    const applicable = computed(() => {
      const spec = $klicker.visualisations.find(v => v.component == props.component)
      if (spec == undefined) {
        throw new Error('Missing visualisation spec for ' + props.component)
      }

      return spec.applicable(dimensions.value, measurements.value, props.response.data.length, comparing.value, props.response.data)
    })

    return () => {
      let nodes: VNode[] | undefined

      if (applicable.value) {
        nodes = slots.default!()
      }

      if (nodes == undefined) {
        return h()
      }
      if (nodes.length > 1) {
        return h('div', nodes)
      }
      return nodes[0]
    }
  },
})
