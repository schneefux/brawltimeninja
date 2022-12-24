<template>
  <div
    ref="container"
    :class="['inject-colors relative', {
      'w-full': fullWidth,
      'h-full': fullHeight,
    }]"
  >
    <b-shimmer
      ref="graph"
      :loading="loading"
      :class="{
        'w-full': fullWidth,
        'h-full': fullHeight,
      }"
    ></b-shimmer>

    <button
      v-if="showDownload"
      class="w-10 h-10 absolute bottom-0 left-0 -ml-2"
      @click="download()"
    >
      <font-awesome-icon
        :icon="faDownload"
      ></font-awesome-icon>
    </button>
  </div>
</template>

<script lang="ts">
import embed, { Result, VisualizationSpec } from 'vega-embed'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import BShimmer from './b-shimmer.vue'
import { defineComponent, onMounted, onUnmounted, PropType, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'

export default defineComponent({
  components: {
    FontAwesomeIcon,
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
    const result = ref<Result|undefined>(undefined)

    const cleanup = () => {
      result.value?.finalize()
      result.value = undefined
    }

    onMounted(() => refresh())
    onUnmounted(() => cleanup())

    const graph = ref<InstanceType<typeof BShimmer>>()

    const refresh = async () => {
      if (graph.value?.$el == undefined || container.value == undefined) {
        return
      }

      loading.value = true
      cleanup()

      const computedStyle = window.getComputedStyle(container.value)
      const textColor = computedStyle.getPropertyValue('--text-color')
      const gridColor = computedStyle.getPropertyValue('--grid-color')
      const primaryColor = computedStyle.getPropertyValue('--primary-color')

      const defaults: VisualizationSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
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

      const spec = Object.assign(<VisualizationSpec>{}, props.spec, defaults)

      result.value = await embed(graph.value.$el as HTMLElement, spec, {
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
      if (result.value == undefined || container.value == undefined) {
        return
      }

      const backgroundColor = window.getComputedStyle(container.value)
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

    useResizeObserver(graph, () => window.requestAnimationFrame(() => refresh()))

    const container = ref<HTMLElement>()

    return {
      container,
      graph,
      loading,
      result,
      faDownload,
      download,
    }
  },
})
</script>

<style scoped lang="postcss">
.inject-colors {
  --text-color:rgb(var(--color-text) / 0.75);
  --grid-color:rgb(var(--color-text) / 0.25);
  --background-color:var(--color-background);
  --primary-color:theme('colors.primary.400');
}
</style>
