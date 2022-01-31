<template>
  <list-of-stats
    :stats="stats"
  ></list-of-stats>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player } from '~/model/Brawlstars'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  computed: {
    stats(): Record<string, number> {
      return {
        trophies: this.player.trophies,
        highestTrophies: this.player.highestTrophies,
        expLevel: this.player.expLevel,
        victories: this.player['3vs3Victories'],
        soloVictories: this.player.soloVictories,
        duoVictories: this.player.duoVictories,
      }
    },
  },
})
</script>
