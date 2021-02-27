<template>
  <div class="w-full flex flex-wrap">
    <div class="w-full flex flex-wrap children-flex-auto">
      <slot
        name="visualisations"
        v-bind="$props"
        full-height
      ></slot>
    </div>

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-barplot
        v-bind="$props"
        class="h-80"
        full-height
      ></v-barplot>

      <v-scatterplot
        v-bind="$props"
        class="h-80"
        full-height
      ></v-scatterplot>

      <v-lineplot
        v-bind="$props"
        class="h-80"
        full-height
      ></v-lineplot>

      <v-heatmap
        v-bind="$props"
        class="h-80"
        full-height
      ></v-heatmap>
    </div>

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-table
        v-bind="$props"
        full-height
      >
        <template
          v-for="(_, name) in $scopedSlots"
          v-slot:[name]="data"
        >
          <slot
            :name="name"
            v-bind="data"
          ></slot>
        </template>
      </v-table>

      <v-tier-list
        v-bind="$props"
        full-height
      >
        <template
          v-for="(_, name) in $scopedSlots"
          v-slot:[name]="data"
        >
          <slot
            :name="name"
            v-bind="data"
          ></slot>
        </template>
      </v-tier-list>

      <v-grid
        v-bind="$props"
        full-height
      >
        <template
          v-for="(_, name) in $scopedSlots"
          v-slot:[name]="data"
        >
          <slot
            :name="name"
            v-bind="data"
          ></slot>
        </template>
      </v-grid>
    </div>

    <div class="w-full flex flex-wrap">
      <v-csv v-bind="$props"></v-csv>
      <v-share v-bind="$props"></v-share>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, State } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  props: {
    state: {
      type: Object as PropType<State>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    data: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    comparing: {
      type: Boolean,
      required: true
    },
  },
})
</script>

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}
</style>
