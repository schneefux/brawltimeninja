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
        <v-bar-plot
          v-bind="$props"
          class="h-80"
          full-height
        ></v-bar-plot>

        <v-scatter-plot
          v-bind="$props"
          class="h-80"
          full-height
        ></v-scatter-plot>

        <v-line-plot
          v-bind="$props"
          class="h-80"
          full-height
        ></v-line-plot>

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
import { CubeResponse } from '~/klicker'
import VBarPlot from '~/klicker/components/visualisations/v-barplot.vue'
import VScatterPlot from '~/klicker/components/visualisations/v-scatterplot.vue'
import VLinePlot from '~/klicker/components/visualisations/v-lineplot.vue'
import VHeatmap from '~/klicker/components/visualisations/v-heatmap.vue'
import VTable from '~/klicker/components/visualisations/v-table.vue'
import VTierList from '~/klicker/components/visualisations/v-tier-list.vue'
import VGrid from '~/klicker/components/visualisations/v-grid.vue'
import VCsv from '~/klicker/components/visualisations/v-csv.vue'
import VShare from '~/klicker/components/visualisations/v-share.vue'
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
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
    query: {
      type: Object as PropType<CubeResponse>,
      required: true,
    },
    loading: {
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
