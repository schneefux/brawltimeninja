<template>
  <main class="container mx-auto p-4">
    <h1
      v-if="title != ''"
      class="text-3xl font-semibold"
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
