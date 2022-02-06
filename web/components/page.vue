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
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    noContainer: {
      type: Boolean,
      default: false
    },
  },
})
</script>
