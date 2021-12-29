<template>
  <div class="w-full">
    <c-dashboard
      v-model="widget.query"
      configurator
    >
      <template v-slot:slices="data">
        <slot
          name="slices"
          v-bind="data"
        ></slot>
      </template>
      <template v-slot:totals="data">
        <slot
          name="totals"
          v-bind="data"
        ></slot>
      </template>
      <template v-slot:data="data">
        <div class="w-full">
          <c-viz-selector
            v-model="widget.component"
            v-bind="data"
          ></c-viz-selector>
          <b-button
            class="mt-1 mb-2 mx-3"
            primary
            md
            @click="addWidget()"
          >Add to Canvas</b-button>
        </div>
      </template>
    </c-dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext, computed } from '@nuxtjs/composition-api'
import CQuery from '~/klicker/components/c-query'
import CVizSelector from '~/klicker/components/c-viz-selector.vue'
import { getSeasonEnd } from '~/lib/util'
import { CubeComparingQuery, CubeQuery, VisualisationSpec } from '..'
import CDashboard from './c-dashboard.vue'
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
import { Widget, render } from './c-canvas.vue'

export default defineComponent({
  components: {
    CQuery,
    BButton,
    CDashboard,
    CVizSelector,
    // does not support SSR
    Moveable: () => import('vue-moveable'),
  },
  props: {
    value: {
      type: Array as PropType<Widget[]>,
      required: true
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      // TODO for debugging
      default: (): CubeQuery => {
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        const currentSeason = getSeasonEnd(twoWeeksAgo)
        return {
          cubeId: 'battle',
          dimensionsIds: ['brawler'],
          measurementsIds: ['winRate'],
          slices: {
            season: [currentSeason.toISOString().slice(0, 10)],
            mode: ['brawlBall'],
            map: [],
            trophyRangeGte: ['0'],
            powerplay: [],
          },
          sortId: 'winRate',
        }
      }
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useContext()

    const specs: Record<string, VisualisationSpec> = Object.fromEntries($klicker.visualisations.map(v => [v.component, v]))

    const widgets = computed({
      get() {
        return props.value
      },
      set(w: Widget[]) {
        emit('input', w)
      },
    })

    const widget = ref({
      query: props.defaultQuery,
      component: '',
    })

    const addWidget = () => widgets.value.push({
      id: Math.random().toString().slice(2),
      query: widget.value.query,
      component: widget.value.component,
      key: 0,
      frame: {
        translate: [0, 0],
        rotate: 0,
        width: 0,
        height: 0,
      },
    })

    const handlers = {
      onDragStart(widget: Widget, e) {
        e.set(widget.frame.translate)
      },
      onDrag(widget: Widget, e) {
        widget.frame.translate = e.beforeTranslate
      },
      onRotateStart(widget: Widget, e) {
        e.set(widget.frame.rotate)
      },
      onRotate(widget: Widget, e) {
        widget.frame.rotate = e.beforeRotate
      },
      onResizeStart(widget: Widget, e) {
        e.setOrigin(['%', '%'])
        e.dragStart && e.dragStart.set(widget.frame.translate)
      },
      onResize(widget: Widget, e) {
        widget.frame.translate = e.drag.beforeTranslate
        widget.frame.width = e.width
        widget.frame.height = e.height
      },
      onRender(widget: Widget, e) {
        Object.assign(e.target.style, render(widget, specs))
      },
    }

    const container = ref<HTMLElement>()

    return {
      specs,
      container,
      widget,
      widgets,
      addWidget,
      ...handlers,
    }
  },
})
</script>
