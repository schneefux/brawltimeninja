<template>
  <fake-select>
    <span slot="preview" class="w-full text-left">
      {{ format(value[0]) }}-{{ format(value[1]) }}
      {{ name == 'Trophies' ? name : '' }}
    </span>

    <client-only>
      <vue-range-slider
        :min="0"
        :max="name == 'Trophies' ? 10 : 18"
        :step="1"
        :min-range="1"
        :value="value"
        :bg-style="bgStyle"
        :process-style="processStyle"
        class="mt-8"
        tooltip-dir="top"
        lazy
        @input="e => onInput(e)"
      >
        <span
          slot="tooltip"
          slot-scope="{ value }"
          class="slider-tooltip !bg-gray-600 !border-gray-600"
        >
          {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
        </span>
      </vue-range-slider>
    </client-only>
  </fake-select>
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
  methods: {
    onInput(e) {
      if (JSON.stringify(e) != JSON.stringify(this.value)) {
        this.$emit('input', e)
      }
    },
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
      if (this.name == 'League') {
        const leagues = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Mythic', 'Legendary', 'Masters']
        return (n: number) => `${leagues[Math.floor(n/3)]} ${n < 18 ? ['I', 'II', 'III'][n%3] : ''}`
      }
      return (n: number) => n == 10 ? '1000+' : n * 100
    },
  },
})
</script>
