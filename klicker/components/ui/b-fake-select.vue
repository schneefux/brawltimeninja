<template>
  <div
    class="inline-block relative"
    v-click-outside="() => dropdownOpen = false"
  >
    <button
      class="w-full flex justify-center font-normal text-sm md:text-base"
      :class="[
        'form-select transition duration-100 ease-in-out',
        'py-2 pl-4 pr-2 bg-black/10 dark:hover:bg-white/10', {
          'rounded-2xl': !dropdownOpen,
          'bg-gray-200 dark:bg-gray-800 rounded-t-2xl': dropdownOpen,
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
    </button>

    <!-- rerender because slider is buggy -->
    <div
      v-show="dropdownOpen"
      :key="dropdownOpen"
      class="absolute left-0 px-2 py-1 pb-1 rounded-b shadow-lg z-10 bg-gray-200 dark:bg-gray-800"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import vClickOutside from 'v-click-outside'

export default defineComponent({
  directives: {
    clickOutside: vClickOutside.directive,
  },
  setup() {
    const dropdownOpen = ref(false)

    return {
      dropdownOpen,
    }
  },
})
</script>
