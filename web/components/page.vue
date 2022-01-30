<template>
  <main class="container mx-auto py-4 px-4 lg:px-0">
    <h1
      v-if="title != ''"
      class="text-2xl font-semibold"
    >{{ title }}</h1>

    <slot></slot>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  props: {
    title: {
      type: String,
      default: ''
    },
  },
})
</script>
