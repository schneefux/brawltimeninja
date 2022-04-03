<template>
  <component
    :is="tag || 'div'"
    :class="tag == undefined ? 'contents' : undefined"
  >
    <component
      v-for="spec in specs"
      :key="spec.name"
      :is="spec.import"
      :row="row"
      :captioned="captioned"
    ></component>
    {{ restText }}
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue-demi'
import { useCubeResponseProps } from '../../composables'
import { MetaGridEntry, ComparingMetaGridEntry, CubeResponse, CubeComparingResponse } from '../../types'

/**
 * Dimension renderer
 * 
 * Using the provided data and the globally configured dimension renderers,
 * render all dimension values into a wrapper.
 */
export default defineComponent({
  props: {
    /**
     * Wrapper tag, defaults to div
     * 
     * Defaults to a div with display: contents
     * 
     * TODO it would be nice to remove the wrapper
     * and return a text node only but Vue 2 does not support that
     */
    tag: {
      type: String,
      required: false
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true as true
    },
    row: {
      type: Object as PropType<MetaGridEntry|ComparingMetaGridEntry>,
      required: true
    },
    captioned: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { $klicker, dimensions } = useCubeResponseProps(props)

    const specs = computed(() => $klicker.dimensionRenderers
      .filter(r => r.applicable(dimensions.value)))

    const restDimensionIds = computed(() => {
      const replacedDimensionIds = specs.value.flatMap(s => s.replacesDimensionIds)
      return dimensions.value.filter(d => !replacedDimensionIds.includes(d.id))
    })

    const restText = computed(
      () => restDimensionIds.value.map(d => props.row.dimensions[d.id]).join(', '))

    return {
      specs,
      restText,
    }
  },
})
</script>