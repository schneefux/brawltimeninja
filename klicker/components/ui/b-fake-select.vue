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
        'py-2 pl-4 pr-2 ring-2 hover:ring-contrast/20 bg-contrast/5 rounded-2xl', {
          'ring-contrast/20': dropdownOpen,
          'ring-contrast/10': !dropdownOpen,
        }]"
      @click="toggleDropdown"
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

    <div
      v-if="'default' in $scopedSlots && dropdownOpen"
      class="absolute ring-2 ring-contrast/20 left-0 px-2 mt-2 py-1 rounded-2xl shadow-lg bg-background z-10"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue-demi'
import { onClickOutside } from '@vueuse/core'

export default defineComponent({
  setup(props, { emit }) {
    const container = ref<HTMLElement>()
    const dropdownOpen = ref(false)

    onClickOutside(container, () => dropdownOpen.value = false)

    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value

      if (dropdownOpen.value) {
        emit('open')
      }
    }

    return {
      container,
      dropdownOpen,
      toggleDropdown,
    }
  },
})
</script>
