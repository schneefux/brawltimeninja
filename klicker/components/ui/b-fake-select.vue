<template>
  <div
    ref="container"
    class="inline-block relative"
  >
    <div
      class="w-full flex justify-center font-normal"
      role="button"
      :aria-pressed="dropdownOpen ? 'true' : 'false'"
      :class="[
        'form-select transition duration-100 ease-in-out',
        'py-2 pl-4 pr-2 ring-2 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/20 rounded-2xl', {
          'bg-gray-200 dark:bg-gray-800': dropdownOpen,
        }]"
      @click="dropdownOpen = !dropdownOpen"
    >
      <slot name="preview"></slot>
      <!-- Tailwind Heroicon name: chevron-down -->
      <svg
        class="ml-2 h-6 w-6 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </div>

    <!-- rerender because slider is buggy -->
    <div
      v-show="dropdownOpen"
      :key="dropdownOpen"
      class="absolute ring-2 ring-black/10 dark:ring-white/10 left-0 px-2 mt-2 py-1 rounded-2xl shadow-lg bg-gray-200 dark:bg-gray-800 z-10"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import { onClickOutside } from '@vueuse/core'

export default defineComponent({
  setup() {
    const container = ref<HTMLElement>()
    const dropdownOpen = ref(false)

    onClickOutside(container, () => dropdownOpen.value = false)

    return {
      container,
      dropdownOpen,
    }
  },
})
</script>
