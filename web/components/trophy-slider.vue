<template>
  <div class="relative">
    <b-button
      class="flex justify-center"
      dark
      sm
      @click="dropdownOpen = !dropdownOpen"
    >
      {{ format(value[0]) }}-{{ format(value[1]) }}
      {{ name }}
      <!-- Tailwind Heroicon name: chevron-down -->
      <svg
        class="-mr-1 ml-2 h-5 w-5 text-gray-500"
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

    <div
      v-show="dropdownOpen"
      class="absolute left-0 mt-1 px-6 pt-10 pb-1 w-56 rounded-md shadow-lg bg-gray-700"
    >
      <client-only>
        <vue-range-slider
          :key="dropdownOpen"
          :min="0"
          :max="10"
          :step="1"
          :min-range="1"
          :value="value"
          :bg-style="bgStyle"
          :process-style="processStyle"
          tooltip-dir="top"
          lazy
          @input="e => $emit('input', e)"
        >
          <span
            slot="tooltip"
            slot-scope="{ value }"
            class="slider-tooltip bg-gray-600! border-gray-600!"
          >
            {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
          </span>
        </vue-range-slider>
      </client-only>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: Array as PropType<number[]>,
      required: true,
    },
    name: {
      type: String,
      default: 'Trophies'
    },
  },
  data() {
    return {
      dropdownOpen: false,
    }
  },
  computed: {
    bgStyle() {
      return {
        backgroundColor: 'rgb(253, 230, 138)', // yellow-200
      }
    },
    processStyle() {
      return {
        backgroundColor: 'rgb(251, 191, 36)', // yellow-400
      }
    },
    format() {
      return (n: number) => n == 10 ? '1000+' : n * 100
    },
  },
})
</script>

<style lang="postcss" scoped>
.bg-gray-600\! {
  @apply bg-gray-600 !important;
}

.border-gray-600\! {
  @apply border-gray-600 !important;
}
</style>
