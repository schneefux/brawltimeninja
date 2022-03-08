<template>
  <div class="grid grid-cols-1 lg:grid-cols-[16rem,minmax(0,1fr)] gap-8">
    <div>
      <div class="lg:sticky lg:top-0 max-w-md">
        <slot name="aside"></slot>
      </div>
    </div>

    <div>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi'

/**
 * Split design with a sticky aside on the left and the main content on the right
 */
export default defineComponent({
})
</script>
