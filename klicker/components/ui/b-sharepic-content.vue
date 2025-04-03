<template>
  <div
    class="sharepic"
    :class="{ 'sharepic--invisible': !debug }"
    ref="sharepic"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import html2canvas from 'html2canvas'

export default defineComponent({
  props: {
    debug: {
      type: Boolean,
      default: false
    },
  },
  emits: {
    ['done']() { return true },
  },
  mounted() {
    // wait in case components need to $fetch
    setTimeout(() => this.render(), 2000)
  },
  methods: {
    async render() {
      if (this.debug) {
        return
      }

      const content = this.$refs['sharepic'] as HTMLElement
      const canvas = await html2canvas(content, {
        // fix image loading from media domain
        useCORS: true,
        scale: 2,
        // html2canvas bug - element needs to be fixed top-left and scroll=0,
        // else the render becomes white
        scrollX: 0,
        scrollY: 0,
      })

      const blob = await new Promise<Blob>((res) => canvas.toBlob((blob) => res(blob!)))
      const files = [new File([blob], 'brawltime-ninja.png', { type: blob.type })]
      let shared = false
      if ((<any>navigator).canShare != undefined && (<any>navigator).canShare({ files })) {
        try {
          await navigator.share({
            files,
            url: window.location,
          } as any)
          shared = true
        } catch (err) {
          console.error(err);
        }
      }

      if (!shared) {
        // opening a window from async is blocked in Safari
        let w = window.open('', '_blank') || window

        const img = new Image()
        img.src = canvas.toDataURL()

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
      }

      this.$emit('done')
    },
  },
})
</script>

<style scoped>
/*
  aspect ratio 1.91 : 1
  https://www.business2community.com/brandviews/presto-media/best-social-media-image-sizes-photo-sharing-every-major-social-network-01911894
*/
.sharepic {
  @apply fixed top-0 left-0;
  width: 600px;
  height: 314px;
}

.sharepic--invisible {
  @apply pointer-events-none;
  left: -9999px;
  top: -9999px;
}
</style>
