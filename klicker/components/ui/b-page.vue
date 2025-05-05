<template>
  <main class="px-4 pt-10 lg:pt-2 pb-8">
    <h1
      v-if="title != ''"
      class="text-3xl"
    >{{ title }}</h1>

    <slot></slot>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Component which wraps the main content with some padding
 */
export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
  },
})
</script>
