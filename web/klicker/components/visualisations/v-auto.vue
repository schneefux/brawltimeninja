<template>
  <!-- workaround for Vue 2 not allowing multiple root elements -->
  <div v-if="specs.length > 1">
    <component
      v-for="spec in specs"
      :key="spec.name"
      :is="spec.import"
      v-bind="props"
      :card="card"
      :loading="loading"
      :response="response"
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
    :is="specs[0].import"
    v-bind="props"
    :card="card"
    :loading="loading"
    :response="response"
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
import { OptionalVisualisationProps, VisualisationSpec } from '~/klicker'
import { useCubeResponse } from '~/klicker/composables/response'

/**
 * Visualisation component that renders the given component, if applicable.
 */
export default defineComponent({
  props: {
    ...OptionalVisualisationProps,
    /**
     * Visualisation component to render, if applicable.
     */
    component: {
      type: String,
      required: false
    },
    /**
     * Render all applicable visualisations.
     */
    all: {
      type: Boolean,
      default: false
    },
    /**
     * Apply default styling for canvas layout.
     */
    forCanvas: {
      type: Boolean,
      default: false
    },
    /**
     * Apply default styling for grid layout.
     */
    forGrid: {
      type: Boolean,
      default: false
    },
    /**
     * Raw props to pass on to the component.
     */
    props: {
      type: undefined,
      required: false
    },
  },
  setup(props) {
    const { $klicker, checkApplicable } = useCubeResponse(props)

    function getStyle(spec: VisualisationSpec) {
      if (props.forGrid) {
        if (spec.grid != undefined) {
          return {
            'grid-row': `span ${spec.grid.initialDimensions.rows} / span ${spec.grid.initialDimensions.rows}`,
            'grid-column': `span ${spec.grid.initialDimensions.columns} / span ${spec.grid.initialDimensions.columns}`,
          }
        }
      }

      if (props.forCanvas) {
        if (spec.canvas?.initialDimensions != undefined) {
          return {
            width: `${spec.canvas.initialDimensions.width}px`,
            height: `${spec.canvas.initialDimensions.height}px`,
          }
        } else {
          return {
            width: 'max-content',
            height: 'max-content',
          }
        }
      }

      return {}
    }

    const specs = computed(() => {
      if (props.component != undefined) {
        const spec = $klicker.visualisations.find(v => v.component == props.component)
        if (spec == undefined) {
          throw new Error('Missing visualisation spec for ' + props.component)
        }

        if (checkApplicable(spec)) {
          return [{
            name: spec.name,
            import: spec.import,
            style: getStyle(spec),
          }]
        }

        console.warn('Visualisation spec for ' + props.component + ' not applicable')
        return []
      }

      const specs = $klicker.visualisations
        .filter(v => checkApplicable(v))
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
