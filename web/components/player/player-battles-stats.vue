<template>
  <list-of-stats
    :stats="stats"
    :elevation="1"
  ></list-of-stats>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from '@nuxtjs/composition-api'
import { PlayerTotals } from '~/store'

export default defineComponent({
  props: {
    playerTotals: {
      type: Object as PropType<PlayerTotals>,
      required: true
    },
  },
  setup(props) {
    const stats = computed(() => ({
      wins: Math.floor(props.playerTotals.winRate * props.playerTotals.picks),
      losses: Math.floor((1 - props.playerTotals.winRate) * props.playerTotals.picks),
    }))

    return {
      stats,
    }
  },
})
</script>
