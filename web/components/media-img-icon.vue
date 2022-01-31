<template>
  <div
    slot="icon"
    class="w-10 h-10 flex items-center justify-center"
  >
    <media-img
      :path="icon"
      :alt="iconAlt"
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
    iconAlt: {
      type: String,
      required: false
    },
  },
})
</script>
