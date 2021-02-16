<template>
  <vue-range-slider
    v-if="seasons.length > 0"
    v-model="season"
    :min="0"
    :max="seasons.length - 2"
    :step="1"
    :bg-style="bgStyle"
    :process-style="processStyle"
    tooltip-dir="top"
    piecewise
    lazy
  >
    <span
      slot="tooltip"
      slot-scope="{ value }"
      class="slider-tooltip bg-gray-600! border-gray-600!"
    >
      {{ formatDate(value) }}
    </span>
  </vue-range-slider>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import Vue from 'vue'
import { formatClickhouse } from '~/lib/util'

interface Row {
  trophy_season_end: string
  picks: number
}

export default Vue.extend({
  props: {
    value: {
      type: String,
    },
  },
  data() {
    return {
      seasons: [] as string[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('seasons.all', 'map',
      ['trophy_season_end'],
      ['trophy_season_end', 'picks'], {
        trophy_season_end: ['2020-06-15 08:00:00'],
      }, {
        cache: 60*60*24,
      })

    data.data.sort((e1: Row, e2: Row) => e1.trophy_season_end.localeCompare(e2.trophy_season_end))
    // slice season with low sample size
    const firstIndex = data.data.findIndex(e => e.picks > 1000000)
    this.seasons = data.data.slice(firstIndex)
      .map(e => formatClickhouse(parseISO(e.trophy_season_end)))
      .sort()
    this.$emit('input', this.seasons[this.seasons.length - 2])
  },
  computed: {
    season: {
      get(): number {
        return this.seasons.findIndex(s => this.value == s)
      },
      set(v: number) {
        this.$emit('input', this.seasons[v])
      },
    },
    formatDate() {
      return (value: number) => format(parseISO(this.seasons[value]), 'PP')
    },
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
