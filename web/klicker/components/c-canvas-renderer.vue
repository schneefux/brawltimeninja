<template>
  <div
    :style="{ width: width + 'px', height: height + 'px' }"
    ref="container"
    class="overflow-hidden relative bg-gray-800"
  >
    <c-query
      v-for="w in styledWidgets"
      :key="w.id"
      :query="w.query"
    >
      <template v-slot="data">
        <div
          class="absolute top-0 left-0"
          :style="w.style"
        >
          <component
            :is="w.component"
            v-bind="data"
            :key="w.key"
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
          </component>
        </div>
      </template>
    </c-query>
  </div>
</template>

<script lang="ts">
import { defineComponent, useContext, computed, PropType } from '@nuxtjs/composition-api'
import CQuery from '~/klicker/components/c-query'
import { VisualisationSpec } from '..'
import BButton from './ui/b-button.vue'
import SSeason from '@/components/klicker/s-season.vue'
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
import { useLocalStorage } from 'vue-composable'
import { Widget, render } from './c-canvas.vue'

export default defineComponent({
  components: {
    CQuery,

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
  },
  props: {
    widgets: {
      type: Array as PropType<Widget[]>,
      required: true
    },
    width: {
      type: Number,
      default: 1200
    },
    height: {
      type: Number,
      default: 630
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const specs: Record<string, VisualisationSpec> = Object.fromEntries($klicker.visualisations.map(v => [v.component, v]))

    const styledWidgets = computed(() => props.widgets.map(w => ({
      ...w,
      style: render(w, specs),
    })))

    return {
      specs,
      styledWidgets,
    }
  },
})
</script>
