<template>
  <div
    v-if="specs.length > 1"
    class="contents"
  >
    <!-- workaround for Vue 2 not allowing multiple root elements -->
    <b-dashboard-cell
      v-for="spec in specs"
      :key="spec.name"
      :style="spec.style"
      :rows="spec.rows"
      :columns="spec.columns"
    >
      <component
        :is="spec.import"
        v-bind="props"
        :card="card"
        :loading="loading"
        :response="response"
      >
        <slot></slot>
      </component>
    </b-dashboard-cell>
  </div>
  <b-dashboard-cell
    v-else-if="specs.length == 1"
    :key="specs[0].name"
    :style="specs[0].style"
    :rows="specs[0].rows"
    :columns="specs[0].columns"
  >
    <component
      :is="specs[0].import"
      v-bind="props"
      :card="card"
      :loading="loading"
      :response="response"
    >
      <slot></slot>
    </component>
  </b-dashboard-cell>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue'
import { CubeComparingResponse, CubeResponse, StaticWidgetSpec } from '../../types'
import { StaticProps } from '../../props'
import { useCubeResponse } from '../../composables/response'
import { useKlicker } from '../../composables/klicker'
import BDashboardCell from '../ui/b-dashboard-cell.vue'

/**
 * Visualisation component that renders the given component, if applicable.
 */
export default defineComponent({
  components: {
    BDashboardCell,
  },
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
      const rows = props.rows ?? spec.initialDimensions.rows
      const columns = props.columns ?? spec.initialDimensions.columns

      return {
        rows,
        columns,
        style: props.ztyle,
      }
    }

    const $klicker = useKlicker()

    const specs = computed(() => {
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
        ...getStyle(spec),
      }))
    })

    return {
      specs,
    }
  },
})
</script>
