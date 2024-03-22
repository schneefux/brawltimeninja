<template>
  <div
    class="grid grid-cols-1 gap-8"
    :class="{
      'lg:grid-cols-[30rem,minmax(0,1fr),0]': ('aside-left' in $slots) && !('aside-right' in $slots),
      'lg:grid-cols-[0,minmax(0,1fr),20rem]': !('aside-left' in $slots) && ('aside-right' in $slots),
      'lg:grid-cols-[20rem,minmax(0,1fr)] 2xl:grid-cols-[30rem,minmax(0,1fr),20rem]': ('aside-left' in $slots) && ('aside-right' in $slots),
    }"
  >
    <aside class="order-1">
      <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:items-end">
        <slot name="aside-left"></slot>
      </div>
    </aside>

    <div class="order-3 lg:my-0 2xl:order-2 relative z-10">
      <slot></slot>
    </div>

    <aside class="order-2 md:hidden 2xl:block 2xl:order-3 relative z-20">
      <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:items-start">
        <slot name="aside-right"></slot>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Split design with a sticky aside left and right and the main content on the right
 *
 * The right aside should only contain supplementary information as it will not be visible on md/lg/xl
 */
export default defineComponent({
})
</script>
