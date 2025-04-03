<template>
  <div
    class="grid grid-cols-1 lg:gap-8"
    :class="{
      'lg:grid-cols-[20rem_minmax(0,1fr)_0]': ('aside-left' in $slots) && !('aside-right' in $slots),
      'lg:grid-cols-[0_minmax(0,1fr)_20rem]': !('aside-left' in $slots) && ('aside-right' in $slots),
      'lg:grid-cols-[20rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)_20rem]': ('aside-left' in $slots) && ('aside-right' in $slots),
    }"
  >
    <aside class="order-1">
      <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:items-end">
        <slot name="aside-left"></slot>
      </div>
    </aside>

    <div class="order-3 lg:my-0 2xl:order-2">
      <slot></slot>
    </div>

    <aside class="order-2 md:hidden 2xl:block 2xl:order-3">
      <div class="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:items-start">
        <slot name="aside-right"></slot>
      </div>
    </aside>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * Three-column layout with sticky sidebars.
 * The left sidebar (L) should contain main content, as it is shown first on mobile.
 * The right sidebar (R) should contain optional content (i.e. navigation hints),
 * as it will not be visible on tablets.
 *
 * Layout:
 *   - desktop: L/M/R from left to right
 *   - tablet: L/M from left to right
 *   - mobile: L/R/M from top to down
 */
export default defineComponent({
})
</script>
