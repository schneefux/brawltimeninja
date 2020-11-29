<template>
  <card>
    <template v-slot:content>
      <p class="text-center">Trophy Season</p>
      <div class="flex w-full">
        <div class="w-full mx-12 mt-10">
          <client-only>
            <vue-range-slider
              v-if="season != undefined && seasons.length > 0"
              :min="0"
              :max="seasons.length - 2"
              :step="1"
              :value="season"
              @input="e => season = e"
              tooltip-dir="top"
              piecewise
              lazy
            >
              <span slot="tooltip" slot-scope="{ value }" class="slider-tooltip">
                starting {{ formatDate(value) }}
              </span>
            </vue-range-slider>
          </client-only>
        </div>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import { format, parseISO } from 'date-fns'
import Vue, { PropType } from 'vue'
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
  },
})
</script>
