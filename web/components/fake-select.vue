<template>
  <div
    class="inline-block relative"
    v-click-outside="() => dropdownOpen = false"
  >
    <b-button
      class="w-full flex justify-center font-normal text-sm md:text-base"
      dark
      sm
      @click="dropdownOpen = !dropdownOpen"
    >
      <slot name="preview"></slot>
      <!-- Tailwind Heroicon name: chevron-down -->
      <svg
        class="ml-2 h-5 w-6 text-gray-500"
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
    </b-button>

    <!-- rerender because slider is buggy -->
    <div
      v-show="dropdownOpen"
      :key="dropdownOpen"
      class="absolute left-0 mt-1 px-6 pt-2 pb-1 w-56 rounded-md shadow-lg bg-gray-700 z-10"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import vClickOutside from 'v-click-outside'

export default Vue.extend({
  directives: {
    clickOutside: vClickOutside.directive,
  },
  data() {
    return {
      dropdownOpen: false,
    }
  },
})
</script>
