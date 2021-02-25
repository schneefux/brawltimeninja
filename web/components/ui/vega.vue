<template>
  <div
    :class="['relative', {
      'w-full': fullWidth,
      'h-full': fullHeight,
    }]"
  >
    <div
      ref="graph"
      :class="{
        'w-full': fullWidth,
        'h-full': fullHeight,
      }"
    ></div>

    <b-button
      v-if="showDownload"
      class="absolute bottom-0 left-0"
      primary
      sm
      @click="download()"
    >
      <font-awesome-icon
        :icon="faExpandAlt"
      ></font-awesome-icon>
    </b-button>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import embed, { Result, VisualizationSpec } from 'vega-embed'
import { faExpandAlt } from '@fortawesome/free-solid-svg-icons'

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
      result: undefined as Result|undefined,
    }
  },
  async mounted() {
    await this.refresh()
  },
  destroyed() {
    this.cleanup()
  },
  computed: {
    faExpandAlt() {
      return faExpandAlt
    },
  },
  methods: {
    cleanup() {
      if (this.result) {
        this.result.finalize()
        this.result = undefined
      }
    },
    async download(ext: 'svg'|'png' = 'png', scaleFactor: number = 2, opts = {
      background: gray900,
      width: 600*1.5,
      height: 314*1.5,
    }) {
      if (this.result == undefined) {
        return
      }

      // opening a window from async is blocked in Safari
      let w = window.open('', '_blank') || window

      const img = new Image()

      const oldBackground = this.result.view.background()
      const oldWidth = this.result.view.width()
      const oldHeight = this.result.view.height()

      this.result.view.background(opts.background)
      // 1.91:1
      this.result.view.width(opts.width)
      this.result.view.height(opts.height)

      img.src = await this.result.view.toImageURL(ext, scaleFactor)

      // reset background and sizes
      this.result.view.background(oldBackground)
      this.result.view.width(oldWidth)
      this.result.view.height(oldHeight)
      this.result.view.runAsync() // image render has replaced the image

      const button = w.document.createElement('button')
      button.style.marginBottom = '10px'
      button.textContent = 'Go Back'

      const a = w.document.createElement('a')
      a.setAttribute('href', window.location.href)
      a.appendChild(button)

      const div = w.document.createElement('div')
      div.appendChild(a)

      const container = w.document.createElement('div')
      container.appendChild(div)
      container.appendChild(img)

      w.document.write(container.outerHTML)
    },
    async refresh() {
      if (!process.client) {
        return
      }

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

      this.result = await embed(this.$refs.graph as HTMLElement, spec, {
        actions: false,
        // canvas: better performance, svg: easily zoomable
        renderer: 'canvas',
      })
    },
  },
  watch: {
    spec: 'refresh',
  },
})
</script>
