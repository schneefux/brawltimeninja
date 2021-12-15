<template>
  <div class="flex flex-wrap">
    <c-configurator
      v-if="configurator"
      v-model="query"
      v-bind="$attrs"
      class="flex-auto"
      full-height
    ></c-configurator>

    <c-slicer
      v-if="'slices' in $scopedSlots"
      v-model="query"
      v-bind="$attrs"
      class="w-full md:w-auto"
      full-height
    >
      <template v-slot="slices">
        <slot
          name="slices"
          v-bind="{ ...slices, ...$attrs }"
        ></slot>
      </template>
    </c-slicer>

    <c-slicer
        v-if="'slices' in $scopedSlots && 'comparing' in query"
      v-model="query"
      v-bind="$attrs"
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
      }"
    >
      <template v-slot="totals">
        <slot name="totals" v-bind="{ ...totals, ...$attrs }"></slot>
      </template>
    </c-query>

    <c-query
      v-if="'data' in $scopedSlots"
      :query="query"
    >
      <template v-slot:error="data">
        <c-error
          slot="error"
          v-bind="{ ...data, ...$attrs }"
        ></c-error>
      </template>
      <template v-slot="data">
        <slot name="data" v-bind="{ ...data, ...$attrs }"></slot>
      </template>
    </c-query>

    <slot v-bind="{ ...$attrs, ...query }"></slot>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { CubeQuery } from '~/klicker'
import CQuery from '~/klicker/components/c-query'
import CConfigurator from '~/klicker/components/c-configurator.vue'
import CSlicer from '~/klicker/components/c-slicer.vue'
import CError from '~/klicker/components/c-error.vue'

export default Vue.extend({
  inheritAttrs: false,
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
    configurator: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    metaMetrics(): string[] {
      return this.$klicker.config[this.value.cubeId].metaMeasurements
    },
    query: {
      get(): CubeQuery {
        return this.value
      },
      set(q: CubeQuery) {
        this.$emit('input', q)
      }
    },
  },
})
</script>
