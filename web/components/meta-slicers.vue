<template>
  <card v-bind="$attrs">
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
            dark
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
          <div class="toggle__line w-10 h-4 bg-yellow-200 rounded-full shadow-inner"></div>
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
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

// TODO add big brawler

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: Object as PropType<{
        trophy_season_end: string[],
        brawler_trophyrange: string[],
        battle_event_powerplay?: string[],
      }>,
      required: true
    },
    cube: {
      type: String,
      required: false
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
  @apply bg-yellow-600;
}
</style>
