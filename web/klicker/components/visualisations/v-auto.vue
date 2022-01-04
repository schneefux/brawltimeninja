<template>
  <!-- workaround for Vue 2 not allowing multiple root elements -->
  <div v-if="specs.length > 1">
    <component
      v-for="spec in specs"
      :key="spec.name"
      v-bind="$props"
      :is="spec.import"
      :style="spec.style"
    >
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="slotProps"
      >
        <slot
          v-bind="slotProps"
          :name="slot"
        ></slot>
      </template>
    </component>
  </div>
  <component
    v-else-if="specs.length == 1"
    v-bind="$props"
    :is="specs[0].import"
    :style="specs[0].style"
  >
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from '@nuxtjs/composition-api'
import { VisualisationProps, VisualisationSpec } from '~/klicker'
import { useCubeResponse } from '~/klicker/composables/response'

/**
 * Visualisation component that renders the given component, if applicable.
 * Otherwise, it renders an applicable component.
 */
export default defineComponent({
  props: {
    ...VisualisationProps,
    component: {
      type: String,
      required: false
    },
    all: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const { $klicker, dimensions, measurements, comparing } = useCubeResponse(props)

    function getStyle(spec: VisualisationSpec) {
      return spec.grid != undefined ? {
        'grid-row': `span ${spec.grid.initialDimensions.rows} / span ${spec.grid.initialDimensions.rows}`,
        'grid-column': `span ${spec.grid.initialDimensions.columns} / span ${spec.grid.initialDimensions.columns}`,
      } : {}
    }

    const specs = computed(() => {
      if (props.component != undefined) {
        const spec = $klicker.visualisations.find(v => v.component == props.component)
        if (spec == undefined) {
          throw new Error('Missing visualisation spec for ' + props.component)
        }

        if (spec.applicable(dimensions.value, measurements.value, props.response.data.length, comparing.value, props.response.data)) {
          return [{
            name: spec.name,
            import: spec.import,
            style: getStyle(spec),
          }]
        }

        console.warn('Visualisation spec for ' + props.component + ' not applicable')
      }

      const specs = $klicker.visualisations
        .filter(v => v.applicable(dimensions.value, measurements.value, props.response.data.length, comparing.value, props.response.data))
        .slice(0, props.all ? undefined : 1)

      if (specs.length > 0) {
        return specs.map(s => ({
          name: s.name,
          import: s.import,
          style: getStyle(s),
        }))
      }

      console.warn('Could not find an applicable spec')
      return []
    })

    return {
      specs,
    }
  },
})
</script>
