<template>
  <div
    class="inline-block relative"
    v-click-outside="() => dropdownOpen = false"
  >
    <button
      class="w-full flex justify-center font-normal text-sm md:text-base"
      :class="[
        'form-select transition duration-100 ease-in-out focus:ring focus:ring-offset-0 focus:ring-opacity-50',
        'rounded py-1 px-2 border-2', {
          'bg-gray-700 hover:bg-gray-600 border-gray-500 hover:border-gray-400 focus:border-gray-400 focus:ring-gray-400 text-gray-200': dark,
        }]"
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
    </button>

    <!-- rerender because slider is buggy -->
    <div
      v-show="dropdownOpen"
      :key="dropdownOpen"
      :class="['absolute left-0 px-2 py-1 pb-1 rounded-b shadow-lg z-10', {
        'bg-gray-700': dark,
      }]"
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
  props: {
    dark: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      dropdownOpen: false,
    }
  },
})
</script>
