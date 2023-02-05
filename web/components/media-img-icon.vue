<template>
  <media-img
    :path="icon"
    :alt="alt"
    size="160"
    clazz="w-8 h-8 object-contain"
  ></media-img>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
