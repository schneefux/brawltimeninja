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
      class="dashboard-cell"
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
    class="dashboard-cell"
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
import { VisualisationSpec } from '~/klicker'
import { OptionalVisualisationProps } from '~/klicker/props'
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
     * Row dimension to set.
     * If unset, the specification default will be used.
     */
    rows: {
      type: Number,
      required: false
    },
    /**
     * Column dimension to set.
     * If unset, the specification default will be used.
     */
    columns: {
      type: Number,
      required: false
    },
    /**
     * Raw props to pass on to the component.
     */
    props: {
      type: undefined,
      required: false
    },
    /**
     * Additional styles to apply
     *
     * Workaround for SSR not applying c-widget styles.
     */
    ztyle: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const { $klicker, checkApplicable } = useCubeResponse(props)

    function getStyle(spec: VisualisationSpec) {
      const style: Record<string, string> = {}

      const rows = props.rows ?? spec.initialDimensions.rows
      const columns = props.columns ?? spec.initialDimensions.columns

      if (props.forGrid) {
        style['--rows'] = `${rows}`
        style['--columns'] = `${columns}`
      }

      if (props.forCanvas) {
        if (spec.resizable) {
          style.width = `${columns * 150}px`
          style.height = `${rows * 150}px`
        } else {
          style.width = 'max-content'
          style.height = 'max-content'
        }
      }

      return Object.assign(style, props.ztyle)
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
