<template>
  <div class="section text-center">
    <div>
      <span class="mr-1">Time:</span>
      <button
        v-for="(label, t) in timeRangeLabel"
        :key="t"
        class="mr-1 mb-1 button button-sm"
        :class="{ 'button--selected': timeRange == t }"
        @click="timeRange = t"
      >
        {{ label }}
      </button>
    </div>

    <div>
      <trophy-slider v-model="trophyRange"></trophy-slider>
    </div>

    <p v-if="sample != undefined">
      Data is based on over {{ formatSI(sample) }} battles.
    </p>
    <p v-if="sample != undefined && sampleMin != undefined && sample < sampleMin">
      Not enough data! Select a broader filter or come back later.
    </p>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatSI } from '../lib/util'
import { format } from 'path'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<{
        trophy_season_end: string[],
        brawler_trophyrange: number[],
      }>,
      required: true
    },
    sample: {
      type: Number,
      required: false
    },
    sampleMin: {
      type: Number,
      default: false
    },
  },
  data() {
    return {
      timeRangeLabel: {
        'current': 'Season',
        'balance': 'Last Update',
        'month': 'Month',
      },
    }
  },
  computed: {
    formatSI() {
      return formatSI
    },
    trophyRange: {
      get(): number[] {
        return this.value.brawler_trophyrange
      },
      set(v: number[]) {
        this.$emit('input', {
          ...this.value,
          brawler_trophyrange: v,
        })
      }
    },
    timeRange: {
      get(): string {
        return this.value.trophy_season_end[0]
      },
      set(v: string) {
        this.$emit('input', {
          ...this.value,
          trophy_season_end: [v],
        })
      }
    },
  },
})
</script>
