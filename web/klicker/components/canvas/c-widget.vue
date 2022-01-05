<template>
  <c-query
    v-if="valid && widget.query != undefined"
    :query="widget.query"
  >
    <template v-slot="data">
      <v-auto
        v-bind="data"
        :props="widget.props"
        :component="widget.component"
        :style="style"
        :for-canvas="forCanvas"
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
      </v-auto>
    </template>
  </c-query>
  <v-auto
    v-else-if="valid"
    :props="widget.props"
    :component="widget.component"
    :style="style"
    :for-canvas="forCanvas"
    :loading="false"
    :response="undefined"
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
  </v-auto>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import CQuery from '~/klicker/components/c-query'
import { VisualisationSpec, Widget } from '~/klicker'
import VAuto from '~/klicker/components/visualisations/v-auto.vue'

/**
 * Return a style object to position this widget on a canvas.
 * Uses frame sizings or specified defaults, if available.
 */
export function render(frame: Widget['frame'], spec: VisualisationSpec) {
  const { translate, scale, rotate, width, height } = frame
  const style: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '0',
    transformOrigin: '50% 50%',
  }
  let transform = ''

  if (translate[0] || translate[1]) {
    transform += `translate(${translate[0]}px, ${translate[1]}px) `
  }
  if (rotate) {
    transform += `rotate(${rotate}deg) `
  }
  if (scale[0] != 1 || scale[1] != 1) {
    transform += `scale(${scale[0]}, ${scale[1]}) `
  }

  style.transform = transform

  if (spec.canvas?.initialDimensions != undefined) {
    style.width = `${spec.canvas.initialDimensions.width}px`
    style.height = `${spec.canvas.initialDimensions.height}px`
  } else {
    style.width = 'max-content'
    style.height = 'max-content'
  }

  if (width) {
    style.width = `${width}px`
  }
  if (height) {
    style.height = `${height}px`
  }

  return style
}

/**
 * Execute the query of the given widget.
 * Render its visualisation component.
 * Optionally, apply widget styles for canvas or grid layout.
 */
export default defineComponent({
  components: {
    CQuery,
    VAuto,
  },
  props: {
    widget: {
      type: Object as PropType<Widget>,
      required: true
    },
    /**
     * Apply styles for rendering in a canvas.
     */
    forCanvas: {
      type: Boolean,
      default: false
    },
    // TODO forGrid
  },
  setup(props) {
    const { $klicker } = useContext()
    const spec = computed(() => $klicker.visualisations.find(v => v.component == props.widget.component))
    const valid = computed(() => {
      if (spec.value == undefined) {
        return false
      }

      if (spec.value.props == undefined) {
        return true
      }

      if (Object.keys(props.widget.props).every(key => key in spec.value!.props!)) {
        return true
      }
    })

    const style = computed(() => props.forCanvas && valid.value ? render(props.widget.frame, spec.value!) : {})

    return {
      valid,
      style,
    }
  },
})
</script>
