<template>
  <b-card
    title="Configure Widget"
    :elevation="elevation"
    full-height
  >
    <div slot="content">
      <div class="grid grid-cols-[max-content,max-content] gap-x-4 gap-y-2 my-1 items-center">
        <label
          for="`${prefix}-widget`"
          class="font-semibold"
        >Widget</label>
        <b-select
          :id="`${prefix}-widget`"
          :value="component"
          dark
          sm
          @input="c => component = c"
        >
          <option
            v-for="v in visualisations"
            :key="v.component"
            :value="v.component"
          >
            {{ v.name }}
          </option>
        </b-select>

        <template v-for="(propSpec, prop) in (spec.props || {})">
          <label
            :key="`${prop}-label`"
            :for="`${prefix}-${prop}`"
            class="font-semibold"
          >
            {{ propSpec.name }}
          </label>
          <component
            v-bind="propSpec.props"
            :key="`${prop}-component`"
            :id="`${prefix}-${prop}`"
            :value="value.props[prop]"
            :is="propSpec.import || propSpec.component"
            @input="v => setWidgetProp(prop, v)"
          ></component>
        </template>
      </div>
    </div>

    <div slot="actions">
      <b-button
        sm
        primary
        @click="$emit('delete')"
      >Delete Widget</b-button>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse, GridWidget, ReportWidget, StaticWidgetSpec, VisualisationSpec, Widget } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import BSelect from '~/klicker/components/ui/b-select.vue'
import { useCubeResponse } from '~/klicker/composables/response'
import { StaticProps } from '~/klicker/props'

/**
 * Show applicable visualisations and bind one of them.
 */
export default defineComponent({
  components: {
    BCard,
    BSelect,
  },
  props: {
    ...StaticProps,
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: false
    },
    value: {
      type: Object as PropType<Widget>,
      required: true
    },
    spec: {
      type: Object as PropType<VisualisationSpec>,
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
  setup(props, { emit }) {
    const visualisations = computed<StaticWidgetSpec[]>(() => {
      const { $klicker } = useContext()
      if (props.response != undefined) {
        const { checkVisualisationApplicable } = useCubeResponse(ref(props.response))
        return $klicker.visualisations.filter(v => checkVisualisationApplicable(v))
      } else {
        return $klicker.staticWidgets
      }
    })

    const component = computed({
      get() {
        return props.value.component
      },
      set(component: Widget['component']) {
        if (props.forCanvas) {
          const widget: ReportWidget = {
            ...props.value as ReportWidget,
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

          emit('input', widget)
        }

        if (props.forGrid) {
          const widget: GridWidget = {
            ...props.value as GridWidget,
            props: {},
            component,
            frame: {
              rows: props.spec.initialDimensions.rows,
              columns: props.spec.initialDimensions.columns,
            },
          }

          emit('input', widget)
        }
      }
    })

    const setWidgetProp = (prop: string, value: any) => {
      const widget: Widget = {
        ...props.value,
        props: {
          ...props.value.props,
          [prop]: value,
        }
      }

      emit('input', widget)
    }

    const prefix = Math.random().toString().slice(2)

    return {
      component,
      setWidgetProp,
      visualisations,
      prefix,
    }
  },
})
</script>
