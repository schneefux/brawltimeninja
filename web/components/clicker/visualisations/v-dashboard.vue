<template>
  <div class="w-full flex flex-wrap">
    <!-- TODO fix SSR error -->
    <client-only>
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

      <div class="w-full flex flex-wrap gap-x-2">
        <v-csv v-bind="$props"></v-csv>
        <v-share v-bind="$props"></v-share>
      </div>
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement, State } from '~/lib/cube'
import { MetaGridEntry } from '~/lib/util'
import VBarPlot from '~/components/clicker/visualisations/v-barplot.vue'
import VScatterPlot from '~/components/clicker/visualisations/v-scatterplot.vue'
import VLinePlot from '~/components/clicker/visualisations/v-lineplot.vue'
import VHeatmap from '~/components/clicker/visualisations/v-heatmap.vue'
import VTable from '~/components/clicker/visualisations/v-table.vue'
import VTierList from '~/components/clicker/visualisations/v-tier-list.vue'
import VGrid from '~/components/clicker/visualisations/v-grid.vue'
import VCsv from '~/components/clicker/visualisations/v-csv.vue'
import VShare from '~/components/clicker/visualisations/v-share.vue'

export default Vue.extend({
  components: {
    VBarPlot,
    VScatterPlot,
    VLinePlot,
    VHeatmap,
    VTable,
    VTierList,
    VGrid,
    VCsv,
    VShare,
  },
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
