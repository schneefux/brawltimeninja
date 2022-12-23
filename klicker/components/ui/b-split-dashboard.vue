<template>
  <div
    class="grid grid-cols-1 gap-8"
    :class="{
      'lg:grid-cols-[16rem,minmax(0,1fr)]': 'aside' in $slots,
    }"
  >
    <aside class="relative z-20">
      <div class="lg:sticky lg:top-0 max-w-md">
        <slot name="aside"></slot>
      </div>
    </aside>

    <div class="relative z-10">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Split design with a sticky aside on the left and the main content on the right
 */
export default defineComponent({
})
</script>
