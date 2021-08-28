<template>
  <div class="flex flex-wrap">
    <c-configurator
      v-if="configurator"
      v-model="state"
      v-bind="$attrs"
      class="flex-auto md:flex-none"
      full-height
    ></c-configurator>

    <c-slicer
      v-if="slicer"
      v-model="state"
      v-bind="$attrs"
      class="w-full md:w-auto"
      full-height
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="data"
        ></slot>
      </template>
    </c-slicer>

    <c-slicer
      v-if="slicer && value.comparingSlices"
      v-model="state"
      v-bind="$attrs"
      class="w-full md:w-auto"
      comparing
      full-height
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="{ ...data, ...$attrs }"
        ></slot>
      </template>
    </c-slicer>

    <c-query
      v-if="metaMetrics.length > 0"
      :state="{
        ...value,
        dimensionsIds: [],
        measurementsIds: metaMetrics,
      }"
    >
      <template v-slot="data">
        <slot name="totals" v-bind="{ ...data, ...$attrs }"></slot>
      </template>
    </c-query>

    <c-query :state="value">
      <template v-slot="data">
        <slot v-bind="{ ...data, ...$attrs }"></slot>
      </template>
    </c-query>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { State } from '~/lib/cube'
import CSlicer from './c-slicer.vue'
import CConfigurator from './c-configurator.vue'

export default Vue.extend({
  inheritAttrs: false,
  components: {
    CSlicer,
    CConfigurator,
  },
  props: {
    value: {
      type: Object as PropType<State>,
      required: true
    },
    configurator: {
      type: Boolean,
      default: false
    },
    slicer: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    metaMetrics(): string[] {
      return this.$cube.config[this.value.cubeId].metaMeasurements
    },
    state: {
      get(): State {
        return this.value
      },
      set(s: State) {
        this.$emit('input', s)
      }
    },
  },
})
</script>
