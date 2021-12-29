<template>
  <div class="flex flex-wrap justify-center items-center">
    <div
      :style="{ width: width + 'px', height: height + 'px' }"
      ref="container"
      class="overflow-hidden relative bg-gray-800"
    >
      <c-query
        v-for="w in widgets"
        :key="w.id"
        :query="w.query"
      >
        <template v-slot="data">
          <moveable
            :container="container"
            :resizable="specs[w.component].canvas != undefined ? specs[w.component].canvas.resizable : false"
            :style="initialStyles[w.id]"
            class="absolute top-0 left-0"
            draggable
            rotatable
            @drag-start="e => onDragStart(w, e)"
            @drag="e => onDrag(w, e)"
            @rotate-start="e => onRotateStart(w, e)"
            @rotate="e => onRotate(w, e)"
            @resize-start="e => onResizeStart(w, e)"
            @resize="e => onResize(w, e)"
            @resize-end="w.key++"
            @render="e => onRender(w, e)"
          >
            <component
              :is="w.component"
              v-bind="data"
              :key="w.key"
              class="pointer-events-none"
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
          </moveable>
        </template>
      </c-query>
      <!--
        TODO:
          - Children müssen die Visualisations importieren :(
          - Limit festlegen
          - Recommendations highlighten
          - Löschen von Visualisierungen
          - Customization erlauben, z.B. page size von v-table (als args in VisualisationSpec definieren)
          - Beliebige andere Elemente supporten, z.B. Bilder und Text
      -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, useContext, computed, watch } from '@nuxtjs/composition-api'
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

export interface Widget {
  id: string
  query: CubeQuery|CubeComparingQuery
  component: string
  key: number
  frame: {
    translate: number[]
    rotate: number
    width: number
    height: number
  }
}

export function render(widget: Widget, specs: Record<string, VisualisationSpec>) {
  const { translate, rotate, width, height } = widget.frame
  const style: Record<string, string> = {}
  let transform = ''

  if (translate[0] || translate[1]) {
    transform += `translate(${translate[0]}px, ${translate[1]}px) `
  }
  if (rotate) {
    transform += `rotate(${rotate}deg) `
  }

  style.transform = transform

  const canvasSpec = specs[widget.component].canvas
  if (width) {
    style.width = `${width}px`
  } else {
    if (canvasSpec?.initialDimensions.width) {
      style.width = `${canvasSpec.initialDimensions.width}px`
    } else {
      style.width = 'max-content'
    }
  }
  if (height) {
    style.height = `${height}px`
  } else {
    if (canvasSpec?.initialDimensions.height) {
      style.height = `${canvasSpec.initialDimensions.height}px`
    } else {
      style.height = 'max-content'
    }
  }

  return style
}

export default defineComponent({
  components: {
    CQuery,
    SSeason, // DEBUG
    BButton,
    CDashboard,
    CVizSelector,
    // does not support SSR
    Moveable: () => import('vue-moveable'),

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
  setup(props, { emit }) {
    const { $klicker } = useContext()

    const specs: Record<string, VisualisationSpec> = Object.fromEntries($klicker.visualisations.map(v => [v.component, v]))

    // to improve performance, do not use computed() for styles, instead, use direct DOM (onRender)
    const initialStyles = Object.fromEntries(props.widgets.map(w => [w.id, render(w, specs)]))
    watch(() => props.widgets, () => {
      // TODO ugly hack
      for (const w of props.widgets) {
        if (!(w.id in initialStyles)) {
          initialStyles[w.id] = render(w, specs)
        }
      }
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
      initialStyles,
      specs,
      container,
      ...handlers,
    }
  },
})
</script>
