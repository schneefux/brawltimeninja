<template>
  <!-- a bit less px than card__content on sm so that the time buttons fit -->
  <div
    class="card card--dark px-3 py-4 md:card__content max-w-sm mx-auto"
    :class="{
      'card--loading': loading,
    }"
  >
    <div class="flex items-center">
      <div class="w-24">
        <span>Timespan</span>
      </div>
      <div class="flex flex-wrap">
        <button
          v-for="(label, t) in timeRangeLabel"
          :key="t"
          class="mr-2 my-1 button button--sm"
          :class="{ 'button--selected': timeRange == t }"
          @click="timeRange = t"
        >
          {{ label }}
        </button>
      </div>
    </div>

    <label
      v-if="cube == 'map'"
      class="flex items-center mt-2"
    >
      <div class="w-24">
        <span>Setting</span>
      </div>
      <span class="mr-3 text-xs">Regular</span>
      <div class="relative">
        <input
          v-model="powerPlayActive"
          type="checkbox"
          class="hidden"
        >
        <div class="toggle__line w-10 h-4 bg-primary rounded-full shadow-inner"></div>
        <div class="toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0"></div>
      </div>
      <span class="ml-3 text-xs">Power Play</span>
    </label>

    <trophy-slider
      v-model="trophyRange"
      :name="powerPlayActive ? 'Points' : undefined"
      class="mb-2"
    ></trophy-slider>

    <p v-if="sample != undefined && sample > 0">
      Statistics are based on over {{ formatSI(sample) }} battles.
    </p>
    <p
      v-if="sample != undefined && sampleMin != undefined && sample < sampleMin"
      class="text-red-400"
    >
      <template v-if="sample > 0">
        Not enough data!
        Select a broader filter or come back later.
      </template>
      <template v-else>
        No data!
        Select a different filter.
      </template>
    </p>

    <div class="mt-2 flex">
      <div class="w-24 flex-shrink-0">
        <span>Metric</span>
      </div>
      <div class="flex flex-wrap">
        <button
          v-for="stat in measurements"
          :key="stat"
          class="mr-2 mb-1 button button--sm"
          :class="{ 'button--selected': selectedMeasurement == stat }"
          @click="selectedMeasurement = stat"
        >
          {{ metaStatMaps.labels[stat] }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { formatSI, metaStatMaps } from '../lib/util'
import { format } from 'path'

// TODO add big brawler

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<{
        trophy_season_end: string[],
        brawler_trophyrange: string[],
        battle_event_powerplay?: string[],
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
    cube: {
      type: String,
      required: false
    },
    measurement: {
      type: String,
      required: false
    },
    measurements: {
      type: Array as PropType<string[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      timeRangeLabel: {
        'current': 'Season',
        'balance': 'Update',
        'month': 'Month',
      },
    }
  },
  computed: {
    formatSI() {
      return formatSI
    },
    metaStatMaps() {
      return metaStatMaps
    },
    selectedMeasurement: {
      get(): string {
        return this.measurement
      },
      set(v: string) {
        this.$emit('select', v)
      }
    },
    trophyRange: {
      get(): number[] {
        return this.value.brawler_trophyrange.map(n => parseInt(n))
      },
      set(v: number[]) {
        this.$emit('input', {
          ...this.value,
          brawler_trophyrange: v.map(n => n.toString()),
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
    powerPlayActive: {
      get(): boolean {
        return (this.value.battle_event_powerplay || [])[0] == 'true'
      },
      set(v: boolean) {
        this.$emit('input', {
          ...this.value,
          battle_event_powerplay: [v ? 'true' : 'false'],
        })
      }
    },
  },
})
</script>

<style scoped lang="postcss">
.toggle__dot {
  top: -.25rem;
  left: -.25rem;
  transition: all 0.3s ease-in-out;
}

input:checked ~ .toggle__dot {
  transform: translateX(100%);
  @apply bg-primary-lighter;
}
</style>
