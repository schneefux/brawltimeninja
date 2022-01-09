<template>
  <div class="flex flex-wrap justify-center items-center">
    <div class="w-full mt-1 grid grid-cols-[max-content,max-content] gap-x-4 gap-y-2 items-center">
      <label
        :for="`${prefix}-width`"
        class="font-semibold"
      >
        Width
      </label>
      <b-number
        v-model="width"
        :id="`${prefix}-width`"
        min="300"
        max="4096"
        step="64"
        dark
      ></b-number>

      <label
        :for="`${prefix}-height`"
        class="font-semibold"
      >
        Height
      </label>
      <b-number
        v-model="height"
        :id="`${prefix}-height`"
        min="300"
        max="16384"
        step="64"
        dark
      ></b-number>

      <b-button
        class="col-span-full"
        primary
        md
        @click="addWidget"
      >Add a new Widget</b-button>
    </div>

    <div
      v-if="selectedWidgetId != undefined && widgets[selectedWidgetId] != undefined"
      class="w-full mt-2"
    >
      <c-widget-editor
        :value="widgets[selectedWidgetId]"
        :default-query="defaultQuery"
        @input="updateWidget"
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
      </c-widget-editor>
    </div>

    <div class="w-full mx-1 my-3 flex justify-center">
      <div
        :style="{ width: width + 'px', height: height + 'px' }"
        ref="container"
        class="overflow-auto relative bg-gray-800"
      >
        <c-moveable-widget
          v-for="(w, id) in widgets"
          :key="w.id"
          :value="widgets[id]"
          :container="container"
          :bounds="bounds"
          @input="updateWidget"
          @click="selectedWidgetId = w.id"
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
        </c-moveable-widget>
        <!--
          TODO:
            - Limit festlegen
            - Recommendations highlighten
            - Löschen von Visualisierungen
        -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import CMoveableWidget from '~/klicker/components/canvas/c-moveable-widget.vue'
import CWidgetEditor from '~/klicker/components/canvas/c-widget-editor.vue'
import BNumber from '~/klicker/components/ui/b-number.vue'
import { Report, ReportWidget, CubeQuery } from '~/klicker'

/**
 * Interactive canvas editor.
 */
export default defineComponent({
  components: {
    BNumber,
    CWidgetEditor,
    CMoveableWidget,
  },
  props: {
    value: {
      type: Object as PropType<Report>,
      required: true
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    const selectedWidgetId = ref<string>()

    const widgets = computed({
      get(): Record<string, ReportWidget> {
        return Object.fromEntries(props.value.widgets.map(w => [w.id, w]))
      },
      set(widgets: Record<string, ReportWidget>) {
        emit('input', { ...props.value, widgets: Object.values(widgets) })
      }
    })

    const width = computed({
      get() {
        return props.value.width
      },
      set(width: number) {
        emit('input', { ...props.value, width })
      }
    })

    const height = computed({
      get() {
        return props.value.height
      },
      set(height: number) {
        emit('input', { ...props.value, height })
      }
    })

    const addWidget = () => {
      const id = Math.random().toString().slice(2)
      const newWidget: ReportWidget = {
        id,
        query: undefined,
        component: 'v-markdown',
        props: {
          markdown: 'Hello World!',
        },
        frame: {
          translate: [0, 0],
          scale: [1, 1],
          rotate: 0,
          width: 0,
          height: 0,
        },
      }
      updateWidget(newWidget)
      selectedWidgetId.value = id
    }

    const updateWidget = (widget: ReportWidget) => widgets.value = { ...widgets.value, [widget.id]: widget }

    const bounds = computed(() => ({
      left: 0,
      top: 0,
      right: props.value.width,
      bottom: props.value.height,
    }))

    const prefix = Math.random().toString().slice(2)

    return {
      prefix,
      bounds,
      container,
      width,
      height,
      widgets,
      addWidget,
      updateWidget,
      selectedWidgetId,
    }
  },
})
</script>
