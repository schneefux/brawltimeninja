<template>
  <h1
    class="text-3xl"
  >{{ title }}</h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    }
  },
})
</script>
