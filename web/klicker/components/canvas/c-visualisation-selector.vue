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

        <template v-for="(propSpec, prop) in spec.props">
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
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { OptionalVisualisationProps, VisualisationSpec, Widget } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import BSelect from '~/klicker/components/ui/b-select.vue'
import { useCubeResponse } from '~/klicker/composables'

/**
 * Show applicable visualisations and bind one of them.
 */
export default defineComponent({
  components: {
    BCard,
    BSelect,
  },
  props: {
    ...OptionalVisualisationProps,
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
    const { $klicker, checkApplicable } = useCubeResponse(props)

    const visualisations = computed(() => $klicker.visualisations.filter(v => checkApplicable(v)))

    const component = computed({
      get() {
        return props.value.component
      },
      set(component: Widget['component']) {
        emit('input', {
          ...props.value,
          ...(props.forCanvas ? {
            frame: {
              translate: [0, 0],
              scale: [1, 1],
              rotate: 0,
              width: 0,
              height: 0,
            },
          } : {
            frame: {
              rows: props.spec.initialDimensions.rows,
              columns: props.spec.initialDimensions.columns,
            },
          }),
          props: {},
          component,
        })
      }
    })

    const setWidgetProp = (prop: string, value: any) => {
      emit('input', {
        ...props.value,
        props: {
          ...props.value.props,
          [prop]: value,
        },
      })
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
