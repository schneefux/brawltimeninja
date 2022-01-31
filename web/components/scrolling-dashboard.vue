<template>
  <div class="relative">
    <div class="dashboard dashboard--horizontal md:dashboard--vertical dashboard--responsive dashboard--responsive-stretch dashboard--relaxed -mr-4 pr-4 md:mr-0 md:pr-0">
      <slot></slot>
    </div>
    <div class="absolute inset-y-0 -right-4 pointer-events-none w-4 bg-gradient-to-r from-transparent to-gray-700 z-10 md:hidden"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
})
</script>

<style scoped lang="postcss">
.scroll-shadow {
  background-image: linear-gradient(to right, theme('colors.gray.900') 0%, theme('colors.gray.700') 100%);
}
</style>
