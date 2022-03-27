<template>
  <div
    slot="icon"
    class="w-8 h-8 flex items-center justify-center"
  >
    <media-img
      :path="icon"
      :alt="alt"
      size="120"
    ></media-img>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: false
    },
  },
})
</script>
