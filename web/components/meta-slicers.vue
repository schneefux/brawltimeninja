<template>
  <card v-bind="$attrs">
    <template v-slot:content>
      <div class="flex md:hidden">
        <b-button
          :selected="showFilters"
          dark
          sm
          class="mr-2 w-10"
          @click="showFilters = !showFilters"
        >
          <font-awesome-icon
            :icon="faFilter"
          ></font-awesome-icon>
        </b-button>

        <span class="text-sm leading-tight">
          {{ filtersDescription }}
        </span>
      </div>

      <div
        :class="['md:flex flex-wrap', {
          'hidden': !showFilters,
          'mt-3': showFilters,
        }]"
      >
        <div class="mr-2 my-1">
          <b-select
            :value="measurement"
            dark
            sm
            @input="m => $emit('measurement', m)"
          >
            <option
              v-for="m in measurements"
              :key="m"
              :value="m"
            >
              {{ metaStatMaps.labels[m] }}
            </option>
          </b-select>
        </div>

        <div class="mr-2 my-1">
          <b-select
            v-model="timeRange"
            dark
            sm
          >
            <option
              v-for="(label, t) in timeRangeLabel"
              :key="t"
              :value="t"
            >
              Current {{ label }}
            </option>
          </b-select>
        </div>

        <div class="mr-2 my-1">
          <b-select
            v-if="cube == 'map'"
            v-model="powerPlayActive"
            dark
            sm
          >
            <option value="false">Regular Battles</option>
            <option value="true">Power Play</option>
          </b-select>
        </div>

        <trophy-slider
          v-if="cube != 'synergy'"
          v-model="trophyRange"
          :name="powerPlayActive ? 'Points' : undefined"
          class="my-1"
        ></trophy-slider>
      </div>
    </template>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps } from '~/lib/util'
import { faFilter } from '@fortawesome/free-solid-svg-icons'

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
    measurement: {
      type: String,
      required: true
    },
    measurements: {
      type: Array as PropType<string[]>,
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
      showFilters: false,
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
      get(): string {
        return (this.value.battle_event_powerplay || [])[0]
      },
      set(v: string) {
        this.$emit('input', {
          ...this.value,
          battle_event_powerplay: [v],
        })
      }
    },
    filtersDescription(): string {
      const formatTrophies = (n: number) => n == 10 ? '1000+' : n * 100
      return `${metaStatMaps.labels[this.measurement]}, Current ${this.timeRangeLabel[this.timeRange]}, ${!this.powerPlayActive ? 'Regular Battles' : 'Power Play'}, ${formatTrophies(this.trophyRange[0])}-${formatTrophies(this.trophyRange[1])} ${!this.powerPlayActive ? 'Trophies' : 'Points'}`
    },
    faFilter() {
      return faFilter
    },
    metaStatMaps() {
      return metaStatMaps
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
