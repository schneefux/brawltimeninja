<template>
  <div class="flex flex-wrap">
    <div
      class="w-full"
      :class="{
        'grid grid-cols-1 lg:grid-cols-3': configurator && slicer,
      }"
    >
      <c-configurator
        v-if="configurator"
        v-model="query"
        :card="{ fullHeight: true, elevation }"
        class="row-span-2"
      ></c-configurator>

      <c-slicer
        v-if="slicer"
        v-model="query"
        :card="{ fullHeight: true, elevation }"
        :both="syncSlices"
        :components="slicerComponents"
        :exclude-components="slicerExcludeComponents"
        class="col-span-2"
      ></c-slicer>

      <c-slicer
        v-if="slicer && query.comparing && !syncSlices"
        v-model="query"
        :card="{ fullHeight: true, elevation }"
        :components="slicerComponents"
        :exclude-components="slicerExcludeComponents"
        class="col-span-2"
        comparing
      ></c-slicer>
    </div>

    <c-query
      v-if="'totals' in $scopedSlots && metaMetrics.length > 0"
      :query="{
        ...query,
        dimensionsIds: [],
        metricsIds: metaMetrics,
        sortId: metaMetrics[0],
        comparing: false,
      }"
    >
      <template v-slot="totals">
        <slot name="totals" v-bind="{ ...totals, card: { elevation } }"></slot>
      </template>
    </c-query>

    <c-query
      v-if="'data' in $scopedSlots"
      :query="query"
    >
      <template v-slot:error="data">
        <c-error
          slot="error"
          v-bind="{ ...data, elevation }"
        ></c-error>
      </template>
      <template v-slot="data">
        <slot name="data" v-bind="{ ...data, card: { elevation } }"></slot>
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
      type: Boolean,
      default: false
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
  },
  setup(props, { emit }) {
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

    return {
      metaMetrics,
      query,
    }
  },
})
</script>
