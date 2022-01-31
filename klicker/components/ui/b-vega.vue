<template>
  <div
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

    <b-button
      v-if="showDownload"
      class="absolute bottom-0 left-0 -ml-2"
      dark
      xs
      @click="download()"
    >
      <font-awesome-icon
        :icon="faDownload"
        class="pb-px"
      ></font-awesome-icon>
    </b-button>
  </div>
</template>

<script lang="ts">
import embed, { Result, VisualizationSpec } from 'vega-embed'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import BButton from './b-button.vue'
import BShimmer from './b-shimmer.vue'
import { defineComponent, onMounted, onUnmounted, PropType, ref, watch, ComponentPublicInstance } from 'vue-demi'

const gray200 = 'var(--gray-200)'
const gray400 = 'var(--gray-400)'
const gray900 = 'var(--gray-900)'
const primary400 = 'var(--primary-400)'

export default defineComponent({
  components: {
    FontAwesomeIcon,
    BButton,
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

    const graph = ref<ComponentPublicInstance>()

    const refresh = async () => {
      if (graph.value == undefined) {
        return
      }

      loading.value = true
      cleanup()

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
          title: {
            color: gray200,
            subtitleColor: gray200,
          },

          arc: { fill: primary400 },
          area: { fill: primary400 },
          line: { stroke: primary400 },
          path: { stroke: primary400 },
          rect: { fill: primary400 },
          shape: { stroke: primary400 },
          symbol: { fill: primary400 },
          bar: { fill: primary400 },
          text: { fill: gray200 },
          point: { fill: primary400, filled: true },

          style: {
            'guide-label': {
              fill: gray200,
            },
            'guide-title': {
              fill: gray200,
            },
          },

          axis: {
            domainColor: gray200,
            gridColor: gray400,
            tickColor: gray200,
          },
        },
      } as object

      const spec = Object.assign(<VisualizationSpec>{}, props.spec, defaults)

      result.value = await embed(graph.value.$el as HTMLElement, spec, {
        actions: false,
        // canvas: better performance, svg: easily zoomable
        renderer: 'svg',
      })

      loading.value = false
    }

    const download = async (ext: 'svg'|'png' = 'png', scaleFactor: number = 1.5, opts = {
      background: gray900,
      // 1.91:1
      width: 600*1.25,
      height: 315*1.25,
    }) => {
      if (result.value == undefined) {
        return
      }

      result.value.view.background(opts.background)
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

    return {
      graph,
      loading,
      result,
      faDownload,
      download,
    }
  },
})
</script>

<style lang="postcss">
.inject-colors {
  --gray-200: theme('colors.gray.200');
  --gray-400: theme('colors.gray.400');
  --gray-900: theme('colors.gray.900');
  --primary-400: theme('colors.primary.400');
}
</style>
