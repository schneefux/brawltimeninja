<template>
  <div class="flex flex-wrap">
    <c-configurator
      v-if="configurator"
      v-model="query"
      :elevation="elevation"
      class="flex-auto"
      full-height
    ></c-configurator>

    <c-slicer
      v-if="'slices' in $scopedSlots"
      v-model="query"
      :elevation="elevation"
      :both="syncSlices"
      class="w-full md:w-auto"
      full-height
    >
      <template v-slot="slices">
        <slot
          name="slices"
          v-bind="{ ...slices }"
        ></slot>
      </template>
    </c-slicer>

    <c-slicer
      v-if="'slices' in $scopedSlots && query.comparing && !syncSlices"
      v-model="query"
      :elevation="elevation"
      class="w-full md:w-auto"
      comparing
      full-height
    >
      <template v-slot="slices">
        <slot
          name="slices"
          v-bind="{ ...slices, ...$attrs }"
        ></slot>
      </template>
    </c-slicer>

    <c-query
      v-if="'totals' in $scopedSlots && metaMetrics.length > 0"
      :query="{
        ...query,
        dimensionsIds: [],
        measurementsIds: metaMetrics,
        sortId: metaMetrics[0],
        comparing: false,
      }"
    >
      <template v-slot="totals">
        <slot name="totals" v-bind="{ ...totals, card: elevation && { elevation } }"></slot>
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
        <slot name="data" v-bind="{ ...data, card: elevation && { elevation } }"></slot>
      </template>
    </c-query>

    <slot v-bind="{ ...query }"></slot>
  </div>
</template>

<script lang="ts">
import { CubeQuery } from '~/klicker'
import CQuery from '~/klicker/components/c-query'
import CConfigurator from '~/klicker/components/c-configurator.vue'
import CSlicer from '~/klicker/components/c-slicer.vue'
import CError from '~/klicker/components/c-error.vue'
import { defineComponent, PropType, useContext, computed } from '@nuxtjs/composition-api'

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
    syncSlices: {
      type: Boolean,
      default: false
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useContext()

    const metaMetrics = $klicker.config[props.value.cubeId].metaMeasurements
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
