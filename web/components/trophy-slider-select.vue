<template>
  <range-slider-select
    :value="value"
    :name="name == 'Trophies' ? name : ''"
    :max="name == 'Trophies' ? 10 : 18"
    :format="format"
    @input="e => $emit('input', e)"
  ></range-slider-select>
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
  computed: {
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
