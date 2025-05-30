<template>
  <div
    :class="['relative', {
      'w-full': fullWidth,
      'h-full': fullHeight,
    }]"
  >
    <b-shimmer
      ref="graph"
      :loading="loading"
      :class="['inject-colors text-primary-400', {
        'w-full': fullWidth,
        'h-full': fullHeight,
      }]"
    >
    </b-shimmer>

    <button
      v-if="showDownload"
      class="w-10 h-10 absolute bottom-0 left-0 -ml-2"
      @click="download()"
    >
      <fa :icon="faDownload"></fa>
    </button>

    <slot></slot>
  </div>
</template>

<script lang="ts">
import embed, { VisualizationSpec } from 'vega-embed'
import Fa from '../fa.vue'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import BShimmer from './b-shimmer.vue'
import { defineComponent, onMounted, onUnmounted, PropType, ref, useTemplateRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'

export default defineComponent({
  components: {
    Fa,
    BShimmer,
  },
  props: {
    spec: {
      type: Object as PropType<VisualizationSpec>,
      required: true
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    fullHeight: {
      type: Boolean,
      default: false
    },
    showDownload: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const loading = ref(false)
    const result = ref<any|undefined>(undefined) // TODO typing this as Result breaks type inference

    const cleanup = () => {
      result.value?.finalize()
      result.value = undefined
    }

    onMounted(() => refresh())
    onUnmounted(() => cleanup())

    // be careful about https://github.com/vuejs/core/issues/7207#issuecomment-1326599127
    // only works because the <b-shimmer> wrapper is empty
    const graphRef = useTemplateRef<InstanceType<typeof BShimmer>>('graph')

    const refresh = async () => {
      if (graphRef.value?.$el == undefined) {
        return
      }

      loading.value = true
      cleanup()

      const computedStyle = window.getComputedStyle(graphRef.value.$el)
      const textColor = computedStyle.getPropertyValue('--text-color')
      const gridColor = computedStyle.getPropertyValue('--grid-color')
      const primaryColor = computedStyle.getPropertyValue('color')

      const defaults: VisualizationSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
        ...(props.fullWidth ? {
          width: 'container',
        } : {}),
        ...(props.fullHeight ? {
          height: 'container',
        } : {}),

        config: {
          autosize: 'fit',
          background: 'transparent',
          view: {
            stroke: gridColor,
            fill: 'transparent',
          },
          title: {
            color: textColor,
            subtitleColor: textColor,
          },

          arc: { fill: primaryColor },
          area: { fill: primaryColor },
          line: { stroke: primaryColor },
          path: { stroke: primaryColor },
          rect: { fill: primaryColor },
          shape: { stroke: primaryColor },
          symbol: { fill: primaryColor },
          bar: { fill: primaryColor },
          text: { fill: textColor },
          point: { fill: primaryColor, filled: true },

          style: {
            'guide-label': {
              fill: textColor,
            },
            'guide-title': {
              fill: textColor,
            },
          },

          axis: {
            domainColor: textColor,
            gridColor: gridColor,
            tickColor: textColor,
          },
        },
      } as object

      // vega tries to modify the spec, create a deep copy
      const userSpec = JSON.parse(JSON.stringify(props.spec))
      const spec = Object.assign(<VisualizationSpec>{}, userSpec, defaults)

      result.value = await embed(graphRef.value.$el, spec, {
        actions: false,
        // canvas: better performance
        // svg: easily zoomable and support for CSS variable colors
        renderer: 'canvas',
      })

      loading.value = false
    }

    const download = async (ext: 'svg'|'png' = 'png', scaleFactor: number = 1.5, opts = {
      background: undefined as undefined|string,
      // 1.91:1
      width: 600*1.25,
      height: 315*1.25,
    }) => {
      if (result.value == undefined || graphRef.value == undefined) {
        return
      }

      const backgroundColor = window.getComputedStyle(graphRef.value.$el)
        .getPropertyValue('--background-color')

      result.value.view.background(opts.background ?? backgroundColor)
      result.value.view.width(opts.width)
      result.value.view.height(opts.height)

      const imageUrl = await result.value.view.toImageURL(ext, scaleFactor)
      // restore old background and sizes
      refresh()

      const downloader = document.createElement('a')
      downloader.href = imageUrl
      downloader.target = '_blank'
      downloader.download = 'export.' + ext
      downloader.click()
    }

    watch(() => props.spec, () => refresh())

    useResizeObserver(graphRef, () => window.requestAnimationFrame(() => refresh()))

    return {
      loading,
      result,
      faDownload,
      download,
    }
  },
})
</script>

<style scoped>
.inject-colors {
  --text-color: rgb(var(--color-text) / 0.75);
  --grid-color: rgb(var(--color-text) / 0.25);
  --background-color: rgb(var(--color-background));
}
</style>
