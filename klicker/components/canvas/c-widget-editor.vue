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
            ref="staticRef"
            :value="false"
            name="withQuery"
            v-uid
            required
            primary
          ></b-radio>
          <label :for="staticRef?.$el.id">
            Static Widget
          </label>

          <b-radio
            v-model="withQuery"
            ref="dataRef"
            :value="true"
            name="withQuery"
            v-uid
            required
            primary
          ></b-radio>
          <label :for="dataRef?.$el.id">
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
import { defineComponent, PropType, computed, ref } from 'vue'
import { CubeComparingQuery, CubeQuery, Widget } from '../../types'
import CVisualisationSelector from './c-visualisation-selector.vue'
import CDashboard from '../c-dashboard.vue'
import BCard from '../ui/b-card.vue'
import BRadio from '../ui/b-radio.vue'
import BButton from '../ui/b-button.vue'
import { Uid } from '../../directives/uid'

/**
 * Form to edit a widget.
 */
export default defineComponent({
  components: {
    BCard,
    BRadio,
    BButton,
    CDashboard,
    CVisualisationSelector,
  },
  directives: {
    Uid,
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
        return props.modelValue.query != undefined
      },
      set(withQuery: boolean) {
        if (withQuery) {
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

    const staticRef = ref<InstanceType<typeof BRadio>>()
    const dataRef = ref<InstanceType<typeof BRadio>>()

    return {
      query,
      withQuery,
      staticRef,
      dataRef,
    }
  },
})
</script>
