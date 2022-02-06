<template>
  <div class="space-y-8">
    <div
      class="grid gap-8 grid-cols-1"
      :class="{
        'lg:grid-cols-[3fr,5fr]': configurator && slicer,
      }"
    >
      <c-configurator
        v-if="configurator"
        v-model="query"
        v-bind="configurator"
        :card="{ fullHeight: true, elevation }"
        :class="{
          'row-span-2': renderComparingSlicer,
        }"
        class="lg:col-start-1"
      ></c-configurator>

      <c-slicer
        v-if="slicer"
        v-model="query"
        :card="{ fullHeight: true, elevation }"
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
        :card="{ fullHeight: true, elevation }"
        :components="slicerComponents"
        :exclude-components="slicerExcludeComponents"
        class="lg:col-start-2"
        comparing
      ></c-slicer>
    </div>

    <c-query
      v-if="renderTotals"
      :query="{
        ...query,
        dimensionsIds: [],
        metricsIds: metaMetrics,
        sortId: metaMetrics[0],
        comparing: false,
      }"
    >
      <template v-slot="totals">
        <div class="dashboard dashboard--responsive">
          <slot name="totals" v-bind="{ ...totals, card: { elevation } }"></slot>
        </div>
      </template>
    </c-query>

    <c-query
      v-if="renderData"
      :query="query"
    >
      <template v-slot:error="data">
        <c-error
          slot="error"
          v-bind="{ ...data, elevation }"
        ></c-error>
      </template>
      <template v-slot="data">
        <div
          class="dashboard"
          :class="dashboardClass"
        >
          <slot name="data" v-bind="{ ...data, card: { elevation } }"></slot>
        </div>
      </template>
    </c-query>

    <slot v-bind="query"></slot>
  </div>
</template>

<script lang="ts">
import { CubeQuery } from '../types'
import CQuery from './c-query'
import CConfigurator from './c-configurator.vue'
import CSlicer from './c-slicer.vue'
import CError from './c-error.vue'
import { defineComponent, PropType, computed } from 'vue-demi'
import { useKlicker } from '../composables/klicker'

export default defineComponent({
  components: {
    CSlicer,
    CConfigurator,
    CQuery,
    CError,
  },
  props: {
    value: {
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
    dashboardClass: {
      type: String,
      default: 'dashboard--responsive'
    },
  },
  setup(props, { emit, slots }) {
    const { $klicker } = useKlicker()

    const metaMetrics = $klicker.config[props.value.cubeId].metaMetrics
    const query = computed({
      get(): CubeQuery {
        return props.value
      },
      set(q: CubeQuery) {
        emit('input', q)
      }
    })

    const renderComparingSlicer = computed(() => props.slicer && query.value.comparing && !props.syncSlices)
    const renderTotals = computed(() => 'totals' in slots && metaMetrics.length > 0)
    const renderData = computed(() => 'data' in slots)

    return {
      renderComparingSlicer,
      renderTotals,
      renderData,
      metaMetrics,
      query,
    }
  },
})
</script>
