<template>
  <div class="relative">
    <div class="dashboard dashboard--horizontal lg:dashboard--vertical dashboard--responsive dashboard--relaxed -mr-4 pr-4 lg:mr-0 lg:pr-0">
      <slot :limit="(page + 1) * pageSize"></slot>
    </div>
    <div class="absolute inset-y-0 -right-4 pointer-events-none w-4 bg-gradient-to-r from-transparent to-gray-700 z-10 lg:hidden"></div>

    <accordeon-buttons
      v-if="length != undefined"
      v-model="page"
      :pages="length / pageSize"
      class="mt-4 hidden lg:flex"
    ></accordeon-buttons>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'

export default defineComponent({
  props: {
    length: {
      type: Number,
      required: false
    },
    pageSize: {
      type: Number,
      default: 3
    },
  },
  setup() {
    const page = ref(0)

    return {
      page,
    }
  },
})
</script>

<style scoped lang="postcss">
.scroll-shadow {
  background-image: linear-gradient(to right, theme('colors.gray.900') 0%, theme('colors.gray.700') 100%);
}
</style>
