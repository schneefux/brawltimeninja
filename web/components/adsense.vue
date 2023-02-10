<template>
  <ins
    :data-ad-client="dataAdClient"
    :data-ad-slot="dataAdSlot"
    :data-ad-format="dataAdFormat"
    :data-full-width-responsive="dataFullWidthResponsive"
    :data-adtest="dataAdtest"
    class="adsbygoogle inline-block"
  ></ins>
</template>
<script lang="ts">
import { defineComponent, onMounted } from 'vue'

export default defineComponent({
  props: {
    dataAdClient: {
      type: String,
      required: true
    },
    dataAdSlot: {
      type: String,
      required: true
    },
    dataAdFormat: {
      type: String,
      default: 'auto'
    },
    dataFullWidthResponsive: {
      type: Boolean,
      default: false
    },
    dataAdtest: {
      type: Boolean,
      default: import.meta.env.DEV
    },
  },
  setup() {
    onMounted(() => window.adsbygoogle.push({}))
  },
})
</script>
