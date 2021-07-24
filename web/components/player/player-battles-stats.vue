<template>
  <list-of-stats
    class="mt-3 mb-6"
    :stats="stats"
  ></list-of-stats>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export interface BattleTotalRow {
  picks: number
  winRate: number
  trophyChange: number
  brawler: string
}

export default Vue.extend({
  props: {
    battleTotals: {
      type: Object as PropType<BattleTotalRow>,
      required: true
    },
  },
  computed: {
    stats(): Record<string, number> {
      return {
        wins: Math.floor(this.battleTotals.winRate * this.battleTotals.picks),
        losses: Math.floor((1 - this.battleTotals.winRate) * this.battleTotals.picks),
      }
    }
  },
})
</script>
