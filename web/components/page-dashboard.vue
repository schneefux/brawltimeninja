<template>
  <main class="p-4 mt-8">
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
  },
})
</script>
