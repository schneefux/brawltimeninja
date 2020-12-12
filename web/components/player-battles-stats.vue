<template>
  <dl class="mt-3 mb-6 bigstat-wrapper ">
    <div class="flex flex-wrap justify-center items-center mt-2 w-full xl:mx-6 xl:w-auto">
      <dd class="w-1/2 text-right pr-2 font-bold text-3xl text-yellow-500">
        {{ Math.floor(winRate * totalBattles) }}
      </dd>
      <dt class="w-1/2 text-left pl-2 text-xl">
        Wins Recorded
      </dt>
    </div>

    <div class="flex flex-wrap justify-center items-center mt-2 w-full xl:mx-6 xl:w-auto">
      <dd class="w-1/2 text-right pr-2 font-bold text-3xl text-yellow-500">
        {{ Math.floor((1 - winRate) * totalBattles) }}
      </dd>
      <dt class="w-1/2 text-left pl-2 text-xl">
        Losses Recorded
      </dt>
    </div>
  </dl>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Battle } from '~/model/Api'

export interface BattleTotalRow {
  picks: number
  battle_victory: number
  battle_trophy_change: number
}

export default Vue.extend({
  props: {
    battleTotals: {
      type: Object as PropType<BattleTotalRow>,
      required: true
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
  },
  computed: {
    totalBattles(): number {
      return this.battleTotals.picks || this.battles.length
    },
    winRate(): number {
      return this.battleTotals.battle_victory ||
        (this.battles.length == 0 ? 0 : this.battles.filter((battle) => battle.victory).length / this.battles.length)
    },
  },
})
</script>
