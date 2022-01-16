<template>
  <div class="flex flex-wrap justify-evenly">
    <lazy
      v-for="(brawler, index) in Object.values(player.brawlers).slice(0, tease ? 3 : limit)"
      :key="brawler.id"
      :render="index < 3"
      distance="200px"
      translucent
    >
      <div class="w-full max-w-sm" style="height: 194px" slot="placeholder"></div>
      <player-brawler-card
        :brawler="brawler"
        :player-tag="player.tag"
        :enable-klicker-stats="enableKlickerStats"
      ></player-brawler-card>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    tease: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      required: false
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
})
</script>
