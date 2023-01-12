<template>
  <b-card
    title="Edit Widget"
    :elevation="elevation"
  >
    <template v-slot:content>
      <div class="mt-4 flex flex-col gap-y-8">
        <div class="w-full flex gap-4 items-center">
          <h1 class="inline mr-4">
            Widget Kind
          </h1>

          <b-radio
            v-model="withQuery"
            :id="`${prefix}-static`"
            value="false"
            name="withQuery"
            required
            primary
          ></b-radio>
          <label
            :for="`${prefix}-static`"
          >
            Static Widget
          </label>

          <b-radio
            :model-value="withQuery"
            :id="`${prefix}-data`"
            value="true"
            name="withQuery"
            required
            primary
            @update:modelValue="v => withQuery = v"
          ></b-radio>
          <label
            :for="`${prefix}-data`"
          >
            Widget with Data
          </label>
        </div>

        <c-dashboard
          v-if="query != undefined"
          v-model="query"
          :elevation="elevation + 1"
          :configurator="{
            configureCube: true,
            configureMetrics: true,
            configureMetricsOptions: [],
            configureMultipleMetrics: true,
            configureDimensions: true,
            configureCompareMode: true,
          }"
          slicer
        >
          <template v-slot:totals="data">
            <slot
              name="totals"
              v-bind="data"
              :card="{ ...data.card, elevation: data.card && (data.card.elevation + 1) }"
            ></slot>
          </template>
          <template v-slot:data="data">
            <c-visualisation-selector
              v-bind="data"
              :model-value="modelValue"
              :elevation="elevation + 1"
              for-canvas
              @update:modelValue="v => $emit('update:modelValue', v)"
              @delete="$emit('delete')"
            ></c-visualisation-selector>
            <slot></slot>
          </template>
        </c-dashboard>

        <div
          v-else
          class="flex flex-wrap gap-8"
        >
          <c-visualisation-selector
            :model-value="modelValue"
            :elevation="elevation + 1"
            for-canvas
            @update:modelValue="v => $emit('update:modelValue', v)"
            @delete="$emit('delete')"
          ></c-visualisation-selector>

          <slot></slot>
        </div>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { CubeComparingQuery, CubeQuery, Widget } from '../../types'
import CVisualisationSelector from './c-visualisation-selector.vue'
import CDashboard from '../c-dashboard.vue'
import BCard from '../ui/b-card.vue'
import { useUniqueId } from '../../composables/id'

/**
 * Form to edit a widget.
 */
export default defineComponent({
  components: {
    BCard,
    CDashboard,
    CVisualisationSelector,
  },
  props: {
    modelValue: {
      type: Object as PropType<Widget>,
      required: true
    },
    elevation: {
      type: Number,
      default: 1
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: Widget) { return true },
    ['delete']() { return true },
  },
  setup(props, { emit }) {
    const withQuery = computed({
      get() {
        return props.modelValue.query == undefined ? 'false' : 'true'
      },
      set(withQuery: string) {
        if (withQuery == 'true') {
          emit('update:modelValue', {
            ...props.modelValue,
            query: props.defaultQuery,
            component: 'v-table',
            props: {},
          })
        } else {
          emit('update:modelValue', {
            ...props.modelValue,
            query: undefined,
            component: 'v-markdown',
            props: {
              markdown: 'Hello World!',
            },
          })
        }
      }
    })

    const query = computed({
      get() {
        return props.modelValue.query
      },
      set(query: CubeQuery|CubeComparingQuery|undefined) {
        emit('update:modelValue', {
          ...props.modelValue,
          query,
        })
      }
    })

    const { id: prefix } = useUniqueId()

    return {
      prefix,
      query,
      withQuery,
    }
  },
})
</script>
