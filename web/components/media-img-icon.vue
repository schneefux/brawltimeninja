<template>
  <media-img
    :path="icon"
    :alt="iconAlt"
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
    iconAlt: {
      type: String,
      required: false
    },
  },
})
</script>
