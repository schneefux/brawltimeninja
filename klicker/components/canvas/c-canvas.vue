<template>
  <div>
    <div class="w-full grid grid-cols-[max-content,max-content] gap-x-8 gap-y-4 items-center">
      <label :for="titleRef?.$el.id">
        Title
      </label>
      <b-textbox
        v-model="title"
        ref="titleRef"
        v-uid
      ></b-textbox>

      <label :for="widthRef?.$el.id">
        Width
      </label>
      <b-number
        v-model="width"
        ref="widthRef"
        min="300"
        max="4096"
        step="64"
        v-uid
      ></b-number>

      <label :for="heightRef?.$el.id">
        Height
      </label>
      <b-number
        v-model="height"
        ref="heightRef"
        min="300"
        max="16384"
        step="64"
        v-uid
      ></b-number>

      <b-button
        class="mt-4 col-span-full"
        primary
        md
        @click="addWidget"
      >Add a new Widget</b-button>
    </div>

    <div
      v-if="selectedWidgetId != undefined && widgets[selectedWidgetId] != undefined"
      class="mt-8"
    >
      <c-widget-editor
        :model-value="widgets[selectedWidgetId]"
        :default-query="defaultQuery"
        @update:modelValue="w => updateWidget(w as ReportWidget)"
        @delete="deleteSelectedWidget"
      ></c-widget-editor>
    </div>

    <div
      class="w-full h-[75vh] relative mx-1 my-3 border-4 rounded border-gray-400"
      style="overflow: hidden; user-select: unset !important;"
      ref="containerParent"
    >
      <div class="panzoom-exclude absolute bottom-2 right-3 flex gap-x-2 z-10">
        <button @click="zoomOut">
          <font-awesome-icon
            :icon="faSearchMinus"
          ></font-awesome-icon>
        </button>
        <button @click="zoomIn">
          <font-awesome-icon
            :icon="faSearchPlus"
          ></font-awesome-icon>
        </button>
        <button @click="toggleFullscreen">
          <font-awesome-icon
            :icon="isFullscreen ? faCompress : faExpand"
          ></font-awesome-icon>
        </button>
      </div>

      <div
        :style="{ width: width + 'px', height: height + 'px' }"
        ref="container"
        class="relative bg-background border border-gray-400"
      >
        <c-moveable-widget
          v-for="(w, id) in widgets"
          :key="w.id"
          :model-value="widgets[id]"
          :container="container!"
          :bounds="bounds"
          class="panzoom-exclude"
          @update:modelValue="w => updateWidget(w as ReportWidget)"
          @click="selectedWidgetId = w.id"
        ></c-moveable-widget>
        <!--
          TODO:
            - Limit festlegen
            - Recommendations highlighten
        -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue'
import CMoveableWidget from './c-moveable-widget.vue'
import CWidgetEditor from './c-widget-editor.vue'
import BNumber from '../ui/b-number.vue'
import BTextbox from '../ui/b-textbox.vue'
import BButton from '../ui/b-button.vue'
import { Report, ReportWidget, CubeQuery } from '../../types'
import Panzoom, { PanzoomObject } from '@panzoom/panzoom'
import { useFullscreen } from '@vueuse/core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSearchMinus, faSearchPlus, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons'
import { Uid } from '../../directives/uid'

/**
 * Interactive canvas editor.
 */
export default defineComponent({
  components: {
    FontAwesomeIcon,
    BButton,
    BNumber,
    BTextbox,
    CWidgetEditor,
    CMoveableWidget,
  },
  directives: {
    Uid,
  },
  props: {
    modelValue: {
      type: Object as PropType<Report>,
      required: true
    },
    defaultQuery: {
      type: Object as PropType<CubeQuery>,
      required: true
    },
  },
  emits: {
    ['update:modelValue'](value: Report) { return true },
  },
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    const containerParent = ref<HTMLElement>()
    const selectedWidgetId = ref<string>()

    const panzoomInstance = ref<PanzoomObject>()
    onMounted(() => {
      const rect = containerParent.value!.getBoundingClientRect()
      const width = rect.width - 2*4 // border
      const height = rect.height - 2*4 // border
      const zoom = Math.min(width / props.modelValue.width, height / props.modelValue.height)
      panzoomInstance.value = Panzoom(container.value!, {
        canvas: true,
        cursor: undefined,
        excludeClass: 'panzoom-exclude',
        startX: -props.modelValue.width / 2 / zoom + width / 2 / zoom,
        startY: -props.modelValue.height / 2 / zoom + height / 2 / zoom,
        startScale: zoom,
      })
      containerParent.value!.addEventListener('wheel', panzoomInstance.value.zoomWithWheel)
    })
    onUnmounted(() => {
      panzoomInstance.value!.destroy()
      panzoomInstance.value = undefined
    })
    const zoomIn = () => panzoomInstance.value!.zoomIn()
    const zoomOut = () => panzoomInstance.value!.zoomOut()

    const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(containerParent)

    const widgets = computed({
      get(): Record<string, ReportWidget> {
        return Object.fromEntries(props.modelValue.widgets.map(w => [w.id, w]))
      },
      set(widgets: Record<string, ReportWidget>) {
        emit('update:modelValue', { ...props.modelValue, widgets: Object.values(widgets) })
      }
    })

    const title = computed({
      get() {
        return props.modelValue.title
      },
      set(title: string) {
        emit('update:modelValue', { ...props.modelValue, title })
      }
    })

    const width = computed({
      get() {
        return props.modelValue.width
      },
      set(width: number) {
        emit('update:modelValue', { ...props.modelValue, width })
      }
    })

    const height = computed({
      get() {
        return props.modelValue.height
      },
      set(height: number) {
        emit('update:modelValue', { ...props.modelValue, height })
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

    const deleteSelectedWidget = () => {
      widgets.value = Object.fromEntries(Object.entries(widgets.value)
        .filter(([id]) => id != selectedWidgetId.value))
      selectedWidgetId.value = undefined
    }

    const bounds = computed(() => ({
      left: 0,
      top: 0,
      right: props.modelValue.width,
      bottom: props.modelValue.height,
    }))

    const titleRef = ref<InstanceType<typeof BTextbox>>()
    const widthRef = ref<InstanceType<typeof BNumber>>()
    const heightRef = ref<InstanceType<typeof BNumber>>()

    return {
      bounds,
      container,
      containerParent,
      title,
      width,
      height,
      widgets,
      addWidget,
      updateWidget,
      deleteSelectedWidget,
      selectedWidgetId,
      faSearchMinus,
      faSearchPlus,
      faExpand,
      faCompress,
      zoomIn,
      zoomOut,
      isFullscreen,
      toggleFullscreen,
      titleRef,
      widthRef,
      heightRef,
    }
  },
})
</script>
