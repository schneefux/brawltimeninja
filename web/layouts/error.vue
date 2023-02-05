<template>
  <div
    ref="container"
    class="flex flex-col justify-between min-h-screen bg-background text-text"
  >
    <nav class="light bg-primary-400 text-text p-6 flex justify-between items-center flex-wrap gap-y-3 z-40 sticky top-0 lg:static">
      <a
        href="/"
        class="font-semibold text-xl tracking-tight leading-tight"
      >Brawl Time Ninja</a>
    </nav>

    <slot></slot>

    <footer></footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return {
    }
  },
})
</script>
