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
import { defineComponent, computed, PropType, useContext, ref } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse, StaticWidgetSpec } from '~/klicker'
import { StaticProps } from '~/klicker/props'
import { useCubeResponse } from '~/klicker/composables/response'

/**
 * Visualisation component that renders the given component, if applicable.
 */
export default defineComponent({
  props: {
    ...StaticProps,
    loading: {
      type: Boolean,
      required: true as true
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: false
    },
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
    function getStyle(spec: StaticWidgetSpec) {
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
      const { $klicker } = useContext()

      let allSpecs: StaticWidgetSpec[]
      let checkApplicable: (spec: any) => boolean

      if (props.response != undefined) {
        const { checkVisualisationApplicable } = useCubeResponse(ref(props.response))
        allSpecs = $klicker.visualisations.filter(checkVisualisationApplicable)
        checkApplicable = checkVisualisationApplicable
      } else {
        allSpecs = $klicker.staticWidgets
        checkApplicable = () => true
      }

      let applicableSpecs: StaticWidgetSpec[] = []

      if (props.component != undefined) {
        const spec = allSpecs.find(v => v.component == props.component)
        if (spec == undefined) {
          console.warn('Could not find requested visualisation spec ' + props.component)
        } else {
          if (checkApplicable(spec)) {
            applicableSpecs = [spec]
          } else {
            console.warn('Requested visualisation spec ' + props.component + ' not applicable')
          }
        }
      } else {
        applicableSpecs = allSpecs
          .filter(checkApplicable)
          .slice(0, props.all ? undefined : 1)

        if (applicableSpecs.length == 0) {
          console.warn('Could not find any applicable visualisation specs')
        }
      }

      return applicableSpecs.map((spec) => ({
        name: spec.name,
        import: spec.import,
        style: getStyle(spec),
      }))
    })

    return {
      specs,
    }
  },
})
</script>
