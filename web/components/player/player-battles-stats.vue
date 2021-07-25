<template>
  <list-of-stats
    class="mt-3 mb-6"
    :stats="stats"
  ></list-of-stats>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { PlayerTotals } from '~/store'

export default Vue.extend({
  props: {
    playerTotals: {
      type: Object as PropType<PlayerTotals>,
      required: true
    },
  },
  computed: {
    stats(): Record<string, number> {
      return {
        wins: Math.floor(this.playerTotals.winRate * this.playerTotals.picks),
        losses: Math.floor((1 - this.playerTotals.winRate) * this.playerTotals.picks),
      }
    }
  },
})
</script>
