<template>
  <main
    class="p-4 mt-8 mb-8"
    :class="{
      'container mx-auto': !noContainer,
    }"
  >
    <h1
      v-if="title != ''"
      class="text-3xl"
    >{{ title }}</h1>

    <slot></slot>
  </main>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

/**
 * Component which wraps the main content with some padding
 */
export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    /**
     * When set, render a full-width layout across the whole page
     */
    noContainer: {
      type: Boolean,
      default: false
    },
  },
})
</script>
