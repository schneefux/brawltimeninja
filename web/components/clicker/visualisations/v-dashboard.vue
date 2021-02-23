<template>
  <div class="w-full flex flex-wrap">
    <div class="w-full flex flex-wrap children-flex-auto">
      <slot
        name="visualisations"
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        :comparing="comparing"
        full-height
      ></slot>
    </div>

    <v-graph
      :loading="loading"
      :data="data"
      :dimensions="dimensions"
      :measurements="measurements"
      :comparing="comparing"
      title="Graph View"
      class="h-80 flex-auto"
      full-height
    ></v-graph>

    <div class="w-full flex flex-wrap children-flex-auto">
      <v-table
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        :comparing="comparing"
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
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        :comparing="comparing"
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
        :loading="loading"
        :data="data"
        :dimensions="dimensions"
        :measurements="measurements"
        :comparing="comparing"
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
})
</script>

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}
</style>
