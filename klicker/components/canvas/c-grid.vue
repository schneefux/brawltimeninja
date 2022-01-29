<template>
  <div class="flex flex-wrap justify-center items-center">
    <div class="w-full mt-1 grid grid-cols-[max-content,max-content] gap-x-4 gap-y-2 items-center">
      <b-button
        class="col-span-full"
        primary
        md
        @click="addWidget"
      >Add a new Widget</b-button>
    </div>

    <div
      v-if="selectedWidgetId != undefined && widgetsKeyed[selectedWidgetId] != undefined"
      class="w-full mt-2"
    >
      <c-widget-editor
        :value="widgetsKeyed[selectedWidgetId]"
        :default-query="defaultQuery"
        @input="updateWidget"
        @delete="deleteSelectedWidget"
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

        <b-card
          :elevation="3"
          title="Configure Widget Dimensions"
          class="w-full md:w-auto"
          full-height
        >
          <div
            slot="content"
            class="grid grid-cols-[max-content,max-content] gap-x-4 gap-y-2 items-center"
          >
            <label
              :for="`${prefix}-columns`"
              class="font-semibold"
            >
              Columns
            </label>
            <b-number
              :value="widgetsKeyed[selectedWidgetId].frame.columns"
              :id="`${prefix}-width`"
              min="1"
              max="8"
              dark
              @input="c => updateWidgetFrame(selectedWidgetId, { columns: parseInt(c) })"
            ></b-number>

            <label
              :for="`${prefix}-rows`"
              class="font-semibold"
            >
              Rows
            </label>
            <b-number
              :value="widgetsKeyed[selectedWidgetId].frame.rows"
              :id="`${prefix}-rows`"
              min="1"
              max="8"
              dark
              @input="r => updateWidgetFrame(selectedWidgetId, { rows: parseInt(r) })"
            ></b-number>
          </div>
        </b-card>
      </c-widget-editor>
    </div>

    <draggable
      v-model="widgets"
      class="w-full dashboard"
    >
      <c-widget
        v-for="w in widgets"
        :key="w.id + key"
        :widget="w"
        for-grid
        @click.native="selectedWidgetId = w.id"
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
      </c-widget>
    </draggable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue-demi'
import CWidgetEditor from './c-widget-editor.vue'
import CWidget from './c-widget.vue'
import BNumber from '../ui/b-number.vue'
import { Grid, GridWidget, CubeQuery } from '../../types'
import Draggable from 'vuedraggable'

/**
 * Interactive grid editor.
 */
export default defineComponent({
  components: {
    BNumber,
    CWidget,
    CWidgetEditor,
    Draggable,
  },
  props: {
    value: {
      type: Object as PropType<Grid>,
      required: true
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  setup(props, { emit }) {
    const selectedWidgetId = ref<string>()

    const widgets = computed({
      get() {
        return props.value.widgets
      },
      set(widgets: GridWidget[]) {
        emit('input', {
          ...props.value,
          widgets,
        })
      }
    })

    const widgetsKeyed = computed({
      get(): Record<string, GridWidget> {
        return Object.fromEntries(props.value.widgets.map(w => [w.id, w]))
      },
      set(widgets: Record<string, GridWidget>) {
        emit('input', { ...props.value, widgets: Object.values(widgets) })
      }
    })

    const addWidget = () => {
      const id = Math.random().toString().slice(2)
      const newWidget: GridWidget = {
        id,
        query: undefined,
        component: 'v-markdown',
        props: {
          markdown: 'Hello World!',
        },
        frame: {
          rows: 2,
          columns: 2,
        },
      }
      updateWidget(newWidget)
      selectedWidgetId.value = id
    }

    const updateWidget = (widget: GridWidget) => widgetsKeyed.value = {
      ...widgetsKeyed.value,
      [widget.id]: widget,
    }
    const deleteSelectedWidget = () => {
      widgets.value = widgets.value.filter((widget) => widget.id != selectedWidgetId.value)
      selectedWidgetId.value = undefined
    }

    const key = ref(0)
    const updateWidgetFrame = (widgetId: string, framePartial: Partial<GridWidget['frame']>) => {
      widgetsKeyed.value = {
        ...widgetsKeyed.value,
        [widgetId]: {
          ...widgetsKeyed.value[widgetId],
          frame: {
            ...widgetsKeyed.value[widgetId].frame,
            ...framePartial,
          },
        },
      }

      key.value++
    }

    const prefix = Math.random().toString().slice(2)

    return {
      key,
      prefix,
      widgets,
      widgetsKeyed,
      addWidget,
      updateWidget,
      updateWidgetFrame,
      deleteSelectedWidget,
      selectedWidgetId,
    }
  },
})
</script>
