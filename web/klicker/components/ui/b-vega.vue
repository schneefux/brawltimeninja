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
      :class="{
        'w-full': fullWidth,
        'h-full': fullHeight,
      }"
    ></b-shimmer>

    <b-button
      v-if="showDownload"
      class="absolute bottom-0 left-0 mb-1 -ml-2"
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
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import BButton from '~/klicker/components/ui/b-button.vue'
import BShimmer from '~/klicker/components/ui/b-shimmer.vue'
import { defineComponent, onMounted, onUnmounted, PropType, ref, watch, ComponentPublicInstance } from '@nuxtjs/composition-api'

const gray200 = '#e4e4e7'
const gray400 = '#a1a1aa'
const gray900 = '#18181b'
const yellow400 = '#facc15'

export default defineComponent({
  components: {
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
      if (!process.client || graph.value == undefined) {
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

          arc: { fill: yellow400 },
          area: { fill: yellow400 },
          line: { stroke: yellow400 },
          path: { stroke: yellow400 },
          rect: { fill: yellow400 },
          shape: { stroke: yellow400 },
          symbol: { fill: yellow400 },
          bar: { fill: yellow400 },
          text: { fill: gray200 },
          point: { fill: yellow400, filled: true },

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
