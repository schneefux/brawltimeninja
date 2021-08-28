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
      class="slider-tooltip !bg-gray-600 !border-gray-600"
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
    const data = await this.$cube.query({
      cubeId: 'map',
      dimensionsIds: ['season'],
      measurementsIds: ['picks'],
      sortId: 'picks',
      slices: {
        season: ['2020-06-15 08:00:00'],
      },
    })

    data.data.sort((e1, e2) => e1.dimensionsRaw.season.season.localeCompare(e2.dimensionsRaw.season.season))
    // slice season with low sample size
    const firstIndex = data.data.findIndex(e => e.measurementsRaw.picks > 1000000)
    this.seasons = data.data.slice(firstIndex)
      .map(e => formatClickhouse(parseISO(e.dimensionsRaw.season.season)))
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
