<template>
  <div class="space-y-4">
    <div
      class="grid gap-4 grid-cols-1"
      :class="{
        'lg:grid-cols-[3fr,5fr]': configurator && slicer,
      }"
    >
      <c-configurator
        v-if="configurator"
        v-model="query"
        v-bind="configurator"
        :card="{ elevation }"
        :class="{
          'row-span-2': renderComparingSlicer,
        }"
        class="lg:col-start-1"
      ></c-configurator>

      <c-slicer
        v-if="slicer"
        v-model="query"
        :card="{ elevation }"
        :both="syncSlices"
        :components="slicerComponents"
        :exclude-components="slicerExcludeComponents"
        :class="{
          'lg:col-start-2': configurator,
        }"
      ></c-slicer>

      <c-slicer
        v-if="renderComparingSlicer"
        v-model="query"
        :card="{ elevation }"
        :components="slicerComponents"
        :exclude-components="slicerExcludeComponents"
        class="lg:col-start-2"
        comparing
      ></c-slicer>
    </div>

    <c-query
      v-if="renderTotals"
      :query="totalsQuery"
    >
      <template v-slot="totals">
        <!-- TODO remove dashboard -->
        <b-dashboard responsive>
          <slot
            name="totals"
            v-bind="totals"
            :card="{ elevation }"
          ></slot>
        </b-dashboard>
      </template>
    </c-query>

    <slot
      name="totalsQuery"
      v-bind="totalsQuery"
    ></slot>

    <c-query
      v-if="renderData"
      :query="query"
    >
      <template v-slot:error="data">
        <c-error
          slot="error"
          v-bind="data"
          :elevation="{ elevation }"
        ></c-error>
      </template>
      <template v-slot="data">
        <b-dashboard
          v-bind="dashboard"
        >
          <slot
            name="data"
            v-bind="data"
            :card="{ elevation }"
          ></slot>
        </b-dashboard>
      </template>
    </c-query>

    <slot
      name="query"
      v-bind="query"
    ></slot>
  </div>
</template>

<script lang="ts">
import { CubeQuery } from '../types'
import CQuery from './c-query'
import CConfigurator from './c-configurator.vue'
import CSlicer from './c-slicer.vue'
import CError from './c-error.vue'
import BDashboard from './ui/b-dashboard.vue'
import { defineComponent, PropType, computed } from 'vue'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    CSlicer,
    CConfigurator,
    CQuery,
    CError,
    BDashboard,
  },
  props: {
    modelValue: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
    elevation: {
      type: Number,
      required: false
    },
    configurator: {
      type: Object as PropType<{
        configureCube: boolean,
        configureMetrics: boolean,
        configureMetricsOptions: string[],
        configureMultipleMetrics: boolean,
        configureDimensions: boolean,
        configureCompareMode: boolean,
      }>,
      required: false
    },
    slicer: {
      type: Boolean,
      default: false
    },
    syncSlices: {
      type: Boolean,
      default: false
    },
    slicerComponents: {
      type: Array as PropType<string[]>,
      required: false
    },
    slicerExcludeComponents: {
      type: Array as PropType<string[]>,
      required: false
    },
    dashboard: {
      type: Object as PropType<{
        responsive: boolean,
        stretch: boolean,
      }>,
      default: () => ({
        responsive: true,
      })
    },
  },
  emits: {
    ['update:modelValue'](value: CubeQuery) { return true },
  },
  setup(props, { emit, slots }) {
    const { $klicker } = useKlicker()

    const metaMetrics = $klicker.config[props.modelValue.cubeId].metaMetrics
    const query = computed({
      get(): CubeQuery {
        return props.modelValue
      },
      set(q: CubeQuery) {
        emit('update:modelValue', q)
      }
    })

    const totalsQuery = computed(() => ({
      ...query.value,
      dimensionsIds: [],
      metricsIds: metaMetrics,
      sortId: metaMetrics[0],
      comparing: false,
    }))

    const renderComparingSlicer = computed(() => props.slicer && query.value.comparing && !props.syncSlices)
    const renderTotals = computed(() => 'totals' in slots && metaMetrics.length > 0)
    const renderData = computed(() => 'data' in slots)

    return {
      renderComparingSlicer,
      renderTotals,
      renderData,
      metaMetrics,
      query,
      totalsQuery,
    }
  },
})
</script>
