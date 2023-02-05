<template>
  <b-dashboard-cell :columns="4" :rows="3">
    <b-card
      title="Configure Widget"
      :elevation="elevation"
    >
      <template v-slot:content>
        <div>
          <div class="grid grid-cols-[max-content,max-content] gap-x-8 gap-y-4 my-2 items-center">
            <label
              for="`${prefix}-widget`"
            >Widget</label>
            <b-select
              v-model="component"
              :id="`${prefix}-widget`"
              sm
            >
              <option
                v-for="v in visualisations"
                :key="v.component"
                :value="v.component"
              >
                {{ v.name }}
              </option>
            </b-select>

            <template
              v-for="(propSpec, prop) in (spec.props || {})"
              :key="prop"
            >
              <label :for="`${prefix}-${prop}`">
                {{ propSpec.name }}
              </label>
              <component
                v-bind="propSpec.props"
                :id="`${prefix}-${prop}`"
                :model-value="modelValue.props[prop]"
                :is="propSpec.import || propSpec.component"
                @update:modelValue="(v: any) => setWidgetProp(prop, v)"
              ></component>
            </template>
          </div>
        </div>
      </template>

      <template v-slot:actions>
        <div>
          <b-button
            md
            primary
            @click="$emit('delete')"
          >Delete Widget</b-button>
        </div>
      </template>
    </b-card>
  </b-dashboard-cell>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import { CubeComparingResponse, CubeResponse, GridWidget, ReportWidget, StaticWidgetSpec, VisualisationSpec, Widget } from '../../types'
import BCard from '../ui/b-card.vue'
import BSelect from '../ui/b-select.vue'
import BButton from '../ui/b-button.vue'
import { useCubeResponse } from '../../composables/response'
import { StaticProps } from '../../props'
import { useKlicker } from '../../composables/klicker'
import BDashboardCell from '../ui/b-dashboard-cell.vue'
import { useUniqueId } from '../../composables/id'

/**
 * Show applicable visualisations and bind one of them.
 */
export default defineComponent({
  components: {
    BCard,
    BSelect,
    BButton,
    BDashboardCell,
  },
  props: {
    ...StaticProps,
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: false
    },
    modelValue: {
      type: Object as PropType<Widget>,
      required: true
    },
    elevation: {
      type: Number,
      default: 1
    },
    forCanvas: {
      type: Boolean,
      default: false
    },
    forGrid: {
      type: Boolean,
      default: false
    },
  },
  emits: {
    ['delete']() { return true },
    ['update:modelValue'](value: Widget) { return true },
  },
  setup(props, { emit }) {
    const $klicker = useKlicker()

    const visualisations = computed<StaticWidgetSpec[]>(() => {
      if (props.response != undefined) {
        const { checkVisualisationApplicable } = useCubeResponse(ref(props.response))
        return $klicker.visualisations.filter(v => checkVisualisationApplicable(v))
      } else {
        return $klicker.staticWidgets
      }
    })

    const spec = computed(() => (
      $klicker.visualisations.find(v => v.component == props.modelValue.component) ??
      $klicker.staticWidgets.find(w => w.component == props.modelValue.component)
    )!)

    const component = computed({
      get() {
        return props.modelValue.component
      },
      set(component: Widget['component']) {
        if (props.forCanvas) {
          const widget: ReportWidget = {
            ...props.modelValue as ReportWidget,
            props: {},
            component,
            frame: {
              translate: [0, 0],
              scale: [1, 1],
              rotate: 0,
              width: 0,
              height: 0,
            },
          }

          emit('update:modelValue', widget)
        }

        if (props.forGrid) {
          const s: VisualisationSpec = spec.value as VisualisationSpec
          const widget: GridWidget = {
            ...props.modelValue as GridWidget,
            props: {},
            component,
            frame: {
              rows: s.initialDimensions.rows,
              columns: s.initialDimensions.columns,
            },
          }

          emit('update:modelValue', widget)
        }
      }
    })

    const setWidgetProp = (prop: string, value: any) => {
      const widget: Widget = {
        ...props.modelValue,
        props: {
          ...props.modelValue.props,
          [prop]: value,
        }
      }

      emit('update:modelValue', widget)
    }

    const { id: prefix } = useUniqueId()

    return {
      spec,
      component,
      setWidgetProp,
      visualisations,
      prefix,
    }
  },
})
</script>
