<template>
  <div
    :class="['relative', {
      'w-full': fullWidth,
      'h-full': fullHeight,
    }]"
  >
    <shimmer
      ref="graph"
      :loading="loading"
      :class="{
        'w-full': fullWidth,
        'h-full': fullHeight,
      }"
    ></shimmer>

    <b-button
      v-if="showDownload"
      class="absolute bottom-0 left-0"
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
import Vue, { PropType } from 'vue'
import embed, { Result, VisualizationSpec } from 'vega-embed'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

const gray200 = '#e4e4e7'
const gray400 = '#a1a1aa'
const gray900 = '#18181b'
const yellow400 = '#facc15'

export default Vue.extend({
  props: {
    spec: {
      type: Object as PropType<VisualizationSpec>,
      required: true
    },
    fullWidth: {
      type: Boolean
    },
    fullHeight: {
      type: Boolean
    },
    showDownload: {
      type: Boolean
    },
  },
  data() {
    return {
      loading: false,
      result: undefined as Result|undefined,
    }
  },
  mounted() {
    this.refresh()
  },
  destroyed() {
    this.cleanup()
  },
  computed: {
    faDownload() {
      return faDownload
    },
  },
  methods: {
    cleanup() {
      if (this.result) {
        this.result.finalize()
        this.result = undefined
      }
    },
    async download(ext: 'svg'|'png' = 'png', scaleFactor: number = 1.5, opts = {
      background: gray900,
      width: 600*1.25,
      height: 315*1.25,
    }) {
      if (this.result == undefined) {
        return
      }

      const oldBackground = this.result.view.background()
      const oldWidth = this.result.view.width()
      const oldHeight = this.result.view.height()

      this.result.view.background(opts.background)
      // 1.91:1
      this.result.view.width(opts.width)
      this.result.view.height(opts.height)

      const imageUrl = await this.result.view.toImageURL(ext, scaleFactor)
      const downloader = document.createElement('a')
      downloader.href = imageUrl
      downloader.target = '_blank'
      downloader.download = 'export.' + ext
      downloader.click()

      // reset background and sizes
      this.result.view.background(oldBackground)
      this.result.view.width(oldWidth)
      this.result.view.height(oldHeight)
      this.result.view.runAsync() // image render has replaced the image
    },
    async refresh() {
      if (!process.client) {
        return
      }

      this.loading = true
      this.cleanup()

      const defaults: VisualizationSpec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        ...(this.fullWidth ? {
          width: 'container',
        } : {}),
        ...(this.fullHeight ? {
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

      const spec = Object.assign(<VisualizationSpec>{}, this.spec, defaults)

      this.result = await embed((this.$refs.graph as Vue).$el as HTMLElement, spec, {
        actions: false,
        // canvas: better performance, svg: easily zoomable
        renderer: 'svg',
      })

      this.loading = false
    },
  },
  watch: {
    spec: 'refresh',
  },
})
</script>
