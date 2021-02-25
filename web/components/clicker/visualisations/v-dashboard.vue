<template>
  <div class="w-full flex flex-wrap">
    <div class="w-full flex flex-wrap children-flex-auto">
      <slot
        name="visualisations"
        v-bind="context"
        full-height
      ></slot>
    </div>

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-barplot
        v-bind="context"
        class="h-80"
        full-height
      ></v-barplot>

      <v-scatterplot
        v-bind="context"
        class="h-80"
        full-height
      ></v-scatterplot>

      <v-heatmap
        v-bind="context"
        class="h-80"
        full-height
      ></v-heatmap>
    </div>

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-table
        v-bind="context"
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
        v-bind="context"
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
        v-bind="context"
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

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-csv
        v-bind="context"
        full-height
      ></v-csv>
      <v-share
        v-bind="context"
        full-height
      ></v-share>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'

export default Vue.extend({
  props: {
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
  computed: {
    context() {
      return {
        loading: this.loading,
        data: this.data,
        dimensions: this.dimensions,
        measurements: this.measurements,
        comparing: this.comparing,
      }
    },
  },
})
</script>

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}
</style>
