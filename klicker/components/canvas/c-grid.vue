<template>
  <div>
    <div class="w-full grid grid-cols-[max-content,max-content] gap-x-8 gap-y-4 items-center">
      <label
        :for="`${prefix}-title`"
      >
        Title
      </label>
      <b-textbox
        v-model="title"
        :id="`${prefix}-title`"
      ></b-textbox>

      <div class="col-span-full space-y-2">
        <div class="flex gap-x-2 items-center">
          <b-radio
            :model-value="columns == undefined"
            :id="`${prefix}-responsive`"
            :value="true"
            name="responsive"
            required
            primary
            @update:modelValue="v => columns = undefined"
          ></b-radio>
          <label
            :for="`${prefix}-responsive`"
          >
            Responsive layout
          </label>
        </div>

        <div class="flex gap-x-2 items-center">
          <b-radio
            :model-value="columns != undefined"
            :id="`${prefix}-fixed`"
            :value="true"
            name="responsive"
            required
            primary
            @update:modelValue="v => columns = columns || 12"
          ></b-radio>
          <label
            :for="`${prefix}-fixed`"
          >
            Fixed width layout
          </label>
        </div>
      </div>

      <label
        v-if="columns != undefined"
        :for="`${prefix}-width`"
      >
        Width in columns
      </label>
      <b-number
        v-if="columns != undefined"
        v-model="columns"
        :id="`${prefix}-width`"
        min="1"
        max="24"
        required
      ></b-number>

      <b-button
        class="mt-4 col-span-full"
        primary
        md
        @click="addWidget"
      >Add a new Widget</b-button>
    </div>

    <div
      v-if="selectedWidgetId != undefined && widgetsKeyed[selectedWidgetId] != undefined"
      class="mt-4"
    >
      <c-widget-editor
        :value="widgetsKeyed[selectedWidgetId]"
        :default-query="defaultQuery"
        @update:modelValue="updateWidget"
        @delete="deleteSelectedWidget"
      >
        <b-dashboard-cell
          :columns="2"
          :rows="2"
        >
          <b-card
            :elevation="2"
            title="Configure Widget Dimensions"
          >
            <template v-slot:content>
              <div class="grid grid-cols-[max-content,max-content] gap-x-8 gap-y-4 my-2 items-center">
                <label
                  :for="`${prefix}-columns`"
                >
                  Columns
                </label>
                <b-number
                  :model-value="widgetsKeyed[selectedWidgetId].frame.columns"
                  :id="`${prefix}-width`"
                  min="1"
                  max="8"
                  @update:modelValue="c => updateWidgetFrame(selectedWidgetId, { columns: parseInt(c) })"
                ></b-number>

                <label
                  :for="`${prefix}-rows`"
                >
                  Rows
                </label>
                <b-number
                  :model-value="widgetsKeyed[selectedWidgetId].frame.rows"
                  :id="`${prefix}-rows`"
                  min="1"
                  max="8"
                  @update:modelValue="r => updateWidgetFrame(selectedWidgetId, { rows: parseInt(r) })"
                ></b-number>
              </div>
            </template>
          </b-card>
        </b-dashboard-cell>
      </c-widget-editor>
    </div>

    <draggable
      v-model="widgets"
      :style="{
        '--columns': columns,
      }"
      :class="{
        'dashboard--fixed': columns != undefined,
        'dashboard--responsive': columns == undefined,
      }"
      class="mt-16 w-full dashboard"
    >
      <c-widget
        v-for="w in widgets"
        :key="w.id"
        :widget="w"
        for-grid
        @click="selectedWidgetId = w.id"
      ></c-widget>
    </draggable>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue'
import CWidgetEditor from './c-widget-editor.vue'
import CWidget from './c-widget.vue'
import BNumber from '../ui/b-number.vue'
import BTextbox from '../ui/b-textbox.vue'
import { Grid, GridWidget, CubeQuery } from '../../types'
import Draggable from 'vuedraggable'
import BDashboardCell from '../ui/b-dashboard-cell.vue'
import { useUniqueId } from '../../composables/id'

/**
 * Interactive grid editor.
 */
export default defineComponent({
  components: {
    BDashboardCell,
    BNumber,
    BTextbox,
    CWidget,
    CWidgetEditor,
    Draggable,
  },
  props: {
    modelValue: {
      type: Object as PropType<Grid>,
      required: true
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: Grid) { return true },
  },
  setup(props, { emit }) {
    const selectedWidgetId = ref<string>()

    const widgets = computed({
      get() {
        return props.modelValue.widgets
      },
      set(widgets: GridWidget[]) {
        emit('update:modelValue', {
          ...props.modelValue,
          widgets,
        })
      }
    })

    const widgetsKeyed = computed({
      get(): Record<string, GridWidget> {
        return Object.fromEntries(props.modelValue.widgets.map(w => [w.id, w]))
      },
      set(widgets: Record<string, GridWidget>) {
        emit('update:modelValue', { ...props.modelValue, widgets: Object.values(widgets) })
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
    }

    const title = computed({
      get() {
        return props.modelValue.title
      },
      set(title: string) {
        emit('update:modelValue', { ...props.modelValue, title })
      }
    })

    const columns = computed({
      get() {
        return props.modelValue.columns
      },
      set(columns: number|undefined) {
        emit('update:modelValue', { ...props.modelValue, columns })
      }
    })

    const { id: prefix } = useUniqueId()

    return {
      title,
      prefix,
      columns,
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
