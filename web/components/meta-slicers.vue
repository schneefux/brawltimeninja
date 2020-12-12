<template>
  <card
    :loading="loading"
    md
  >
    <template v-slot:content>
      <div class="flex items-center">
        <div class="w-20">
          <span>Timespan</span>
        </div>
        <div class="flex flex-wrap">
          <b-button
            v-for="(label, t) in timeRangeLabel"
            :key="t"
            :selected="timeRange == t"
            class="mr-1 my-1"
            sm
            @click="timeRange = t"
          >
            {{ label }}
          </b-button>
        </div>
      </div>

      <label
        v-if="cube == 'map'"
        class="flex items-center mt-2"
      >
        <div class="w-20">
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
        v-if="cube != 'synergy'"
        v-model="trophyRange"
        :name="powerPlayActive ? 'Points' : undefined"
        class="mb-2"
      ></trophy-slider>

      <p>
        <template v-if="sample != undefined && sample > 0">
          Statistics are based on over {{ formatSI(sample) }} battles.
          <br>
        </template>
        <template v-if="timestamp != undefined">
          Last updated: {{ lastUpdate }}
          <br>
        </template>
        <template v-if="sample > 0">
          Average margin of error:
          <template v-if="moe <= 0.005">
            <span class="text-green-400">{{ moePercent }}</span>
            (perfect accuracy)
          </template>
          <template v-if="moe > 0.005 && moe <= 0.01">
            <span class="text-green-400">{{ moePercent }}</span>
            (good accuracy)
          </template>
          <template v-if="moe > 0.01 && moe <= 0.025">
            <span class="text-orange-400">{{ moePercent }}</span>
            (mediocre accuracy)
          </template>
          <template v-if="moe > 0.025">
            <span class="text-red-400">{{ moePercent }}</span>
            (poor accuracy)
          </template>
        </template>
        <span v-if="sample == 0" class="text-red-400">
          No data!
          Select a different filter.
        </span>
      </p>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { formatSI } from '../lib/util'
import { parseISO, formatDistanceToNow } from 'date-fns'

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
    timestamp: {
      type: String,
      required: false
    },
    sampleMin: {
      type: Number,
      required: false
    },
    cube: {
      type: String,
      required: false
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
    lastUpdate(): string {
      const timestamp = parseISO(this.timestamp)
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    },
    moe(): number|undefined {
      if (this.sample == undefined) {
        return undefined
      }
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (TODO: Assumes we are slicing Brawlers!)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (this.sample / this.totalBrawlers))
    },
    moePercent(): string|undefined {
      if (this.moe == undefined) {
        return undefined
      }
      return (this.moe * 100).toFixed(2) + '%'
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
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
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
