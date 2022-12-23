<template>
  <moveable
    ref="moveable"
    :container="container"
    :bounds="bounds"
    :resizable="spec != undefined ? spec.resizable : false"
    :scalable="spec != undefined ? spec.scalable : false"
    :keep-ratio="spec != undefined ? spec.scalable : false"
    :style="initialStyle"
    class-name="panzoom-exclude"
    snappable
    draggable
    rotatable
    @drag-start="onDragStart"
    @drag="onDrag"
    @drag-end="onDragEnd"
    @scale-start="onScaleStart"
    @scale="onScale"
    @scale-end="onScaleEnd"
    @rotate-start="onRotateStart"
    @rotate="onRotate"
    @rotate-end="onRotateEnd"
    @resize-start="onResizeStart"
    @resize="onResize"
    @resize-end="onResizeEnd"
    @render="onRender"
    @click="$emit('click')"
  >
    <c-widget
      :widget="modelValue"
      class="pointer-events-none"
    ></c-widget>
  </moveable>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch, nextTick, onMounted, defineAsyncComponent } from "vue";
import { ReportWidget, StaticWidgetSpec } from "../../types";
import CWidget, { render } from './c-widget.vue'
import { MoveableInterface } from 'moveable'
import { useKlicker } from '../../composables/klicker'

/**
 * Wrap a <c-widget> inside a <moveable>.
 * The widget with an updated transformation frame is emitted lazyily when a user stops the movement.
 */
export default defineComponent({
  components: {
    CWidget,
    // does not support SSR
    Moveable: defineAsyncComponent(() => import('vue-moveable')),
  },
  props: {
    container: {
      type: undefined as unknown as PropType<HTMLElement>,
      required: true
    },
    bounds: {
      type: Object,
      required: true
    },
    modelValue: {
      type: Object as PropType<ReportWidget>,
      required: true
    },
  },
  emits: {
    ['click']() { return true },
    ['update:modelValue'](value: ReportWidget) { return true },
  },
  setup(props, { emit }) {
    const { $klicker } = useKlicker()
    const moveable = ref<MoveableInterface>()

    const spec = computed<StaticWidgetSpec>(() => (
      $klicker.visualisations.find(v => v.component == props.modelValue.component) ??
      $klicker.staticWidgets.find(v => v.component == props.modelValue.component)
    )!)

    // Keep a local copy of the frame and lazy-sync it on *end to prevent event spam
    const clone = (o: any) => JSON.parse(JSON.stringify(o))
    let frame: ReportWidget['frame'] = clone(props.modelValue.frame)
    watch(() => props.modelValue, (after, before) => {
      if (JSON.stringify(after) != JSON.stringify(before)) {
        frame = clone(props.modelValue.frame)
        Object.assign((<any>moveable.value).$el.style, render(frame, spec.value))
        nextTick(() => moveable.value!.updateRect())
      }
    })

    const sync = () => {
      const widget: ReportWidget = {
        ...props.modelValue,
        frame: clone(frame),
      }
      emit('update:modelValue', widget)
    }

    // Style DOM directly for better performance
    const initialStyle = render(frame, spec.value)
    // workaround for slow component rendering
    onMounted(() => setTimeout(() => moveable.value!.updateRect(), 1000))

    const handlers = {
      onDragStart(e) {
        e.set(frame.translate)
      },
      onDrag(e) {
        frame.translate = e.beforeTranslate
      },
      onDragEnd(e) {
        sync()
      },
      onRotateStart(e) {
        e.set(frame.rotate)
      },
      onRotate(e) {
        frame.rotate = e.beforeRotate
      },
      onRotateEnd(e) {
        sync()
      },
      onScaleStart(e) {
        e.set(frame.scale)
      },
      onScale(e) {
        frame.scale = e.scale
      },
      onScaleEnd(e) {
        sync()
      },
      onResizeStart(e) {
      },
      onResize(e) {
        const beforeTranslate = e.drag.beforeTranslate
        frame.translate = beforeTranslate

        frame.width = e.width
        frame.height = e.height
      },
      onResizeEnd(e) {
        sync()
      },
      onRender(e) {
        Object.assign(e.target.style, render(frame, spec.value))
      },
    }

    // TODO add custom buttons
    // https://codepen.io/daybrush/pen/JjXmbmb

    return {
      spec,
      moveable,
      initialStyle,
      ...handlers,
    }
  },
})
</script>
