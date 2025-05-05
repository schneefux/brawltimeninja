<template>
  <ad kind="top"></ad>

  <main class="px-4 py-6 mt-2 bg-background text-text lg:mx-auto lg:rounded-2xl vm-main-content [--content-size:unset] w-[var(--content-size)]">
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
 * single column page layout
 */
export default defineComponent({
  props: {
    title: {
      type: String,
      required: false
    },
  },
})
</script>
