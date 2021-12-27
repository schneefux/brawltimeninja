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
        <v-if-applicable
          v-bind="$props"
          component="v-barplot"
        >
          <v-barplot
            :card="{ loading, fullHeight: true }"
            v-bind="$props"
            class="h-80"
          ></v-barplot>
        </v-if-applicable>

        <v-if-applicable
          v-bind="$props"
          component="v-scatterplot"
        >
          <v-scatterplot
            v-bind="$props"
            :card="{ loading, fullHeight: true }"
            full-height
            class="h-80"
          ></v-scatterplot>
        </v-if-applicable>

        <v-if-applicable
          v-bind="$props"
          component="v-lineplot"
        >
          <v-lineplot
            :card="{ loading, fullHeight: true }"
            v-bind="$props"
            class="h-80"
          ></v-lineplot>
        </v-if-applicable>

        <v-if-applicable
          v-bind="$props"
          component="v-heatmap"
        >
          <v-heatmap
            :card="{ loading, fullHeight: true }"
            v-bind="$props"
            class="h-80"
          ></v-heatmap>
        </v-if-applicable>
      </div>

      <div class="w-full flex flex-wrap children-flex-auto">
        <v-if-applicable
          v-bind="$props"
          component="v-table"
        >
          <v-table
            v-bind="$props"
            :card="{ fullHeight: true }"
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
        </v-if-applicable>

        <v-if-applicable
          v-bind="$props"
          component="v-tier-list"
        >
          <v-tier-list
            v-bind="$props"
            :card="{ fullHeight: true }"
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
        </v-if-applicable>

        <v-if-applicable
          v-bind="$props"
          component="v-grid"
        >
          <v-grid
            v-bind="$props"
            :card="{ fullHeight: true }"
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
        </v-if-applicable>
      </div>

      <v-if-applicable
        v-bind="$props"
        component="v-test-info"
      >
        <v-test-info
          :card="{ lg: true }"
          v-bind="$props"
        ></v-test-info>
      </v-if-applicable>

      <div class="w-full flex flex-wrap gap-x-2">
        <v-if-applicable
          v-bind="$props"
          component="v-csv"
        >
          <v-csv v-bind="$props"></v-csv>
        </v-if-applicable>
        <v-share v-bind="$props"></v-share>
      </div>
    </client-only>
  </div>
</template>

<script lang="ts">
import { CubeResponse } from '~/klicker'
import VBarplot from '~/klicker/components/visualisations/v-barplot.vue'
import VScatterplot from '~/klicker/components/visualisations/v-scatterplot.vue'
import VLineplot from '~/klicker/components/visualisations/v-lineplot.vue'
import VHeatmap from '~/klicker/components/visualisations/v-heatmap.vue'
import VTable from '~/klicker/components/visualisations/v-table.vue'
import VTierList from '~/klicker/components/visualisations/v-tier-list.vue'
import VGrid from '~/klicker/components/visualisations/v-grid.vue'
import VCsv from '~/klicker/components/visualisations/v-csv.vue'
import VShare from '~/klicker/components/visualisations/v-share.vue'
import VTestInfo from '~/klicker/components/visualisations/v-test-info.vue'
import VIfApplicable from '~/klicker/components/visualisations/v-if-applicable'
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    VBarplot,
    VScatterplot,
    VLineplot,
    VHeatmap,
    VTable,
    VTierList,
    VGrid,
    VCsv,
    VShare,
    VTestInfo,
    VIfApplicable,
  },
  props: {
    loading: {
      type: Boolean,
      required: false
    },
    response: {
      type: Object as PropType<CubeResponse>,
      required: true,
    },
  },
})
</script>

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}
</style>
