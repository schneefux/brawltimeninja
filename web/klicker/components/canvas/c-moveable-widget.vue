<template>
  <moveable
    ref="moveable"
    :container="container"
    :bounds="bounds"
    :resizable="spec != undefined && spec.canvas != undefined ? spec.canvas.resizable : false"
    :scalable="spec != undefined && spec.canvas != undefined ? spec.canvas.scalable : false"
    :keep-ratio="spec != undefined && spec.canvas != undefined ? spec.canvas.scalable : false"
    :style="initialStyle"
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
      :key="key"
      :widget="value"
      class="pointer-events-none"
      no-style
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
  </moveable>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext, watch, nextTick, onMounted } from "@nuxtjs/composition-api";
import { ReportWidget, VisualisationSpec } from "../..";
import CWidget, { render } from './c-widget.vue'
import { MoveableInterface } from 'moveable'

/**
 * Wrap a <c-widget> inside a <moveable>.
 * The widget with an updated transformation frame is emitted lazyily when a user stops the movement.
 */
export default defineComponent({
  components: {
    CWidget,
    // does not support SSR
    Moveable: () => import('vue-moveable'),
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
    value: {
      type: Object as PropType<ReportWidget>,
      required: true
    },
  },
  setup(props, { emit }) {
    const { $klicker } = useContext()
    const moveable = ref<MoveableInterface>()

    const spec = computed<VisualisationSpec>(() => $klicker.visualisations.find(v => v.component == props.value.component)!)

    // Keep a local copy of the frame and lazy-sync it on *end to prevent event spam
    const clone = (o: any) => JSON.parse(JSON.stringify(o))
    let frame: ReportWidget['frame'] = clone(props.value.frame)
    watch(() => props.value, (after, before) => {
      if (JSON.stringify(after) != JSON.stringify(before)) {
        frame = clone(props.value.frame)
        Object.assign((<any>moveable.value).$el.style, render(frame, spec.value))
        nextTick(() => moveable.value!.updateRect())
      }
    })

    const sync = () => {
      emit('input', {
        ...props.value,
        frame: clone(frame),
      })
    }

    // Style DOM directly for better performance
    const initialStyle = render(frame, spec.value)
    // workaround for slow component rendering
    onMounted(() => setTimeout(() => moveable.value!.updateRect(), 1000))

    const key = ref(0)

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
        frame.width = e.width
        frame.height = e.height
      },
      onResizeEnd(e) {
        // re-render child component in case it depends on the initial dimensions
        // (such as <b-vega>)
        key.value++
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
      key,
      moveable,
      initialStyle,
      ...handlers,
    }
  },
})
</script>
