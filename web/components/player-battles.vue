<template>
  <div class="mt-2 flex flex-wrap justify-center">
    <lazy
      v-for="battle in player.battles.slice(0, limit)"
      :key="battle.timestamp"
      class="md:w-1/2 lg:w-1/2"
      distance="640px"
    >
      <div class="w-80" style="height: 214px" slot="placeholder"></div>
      <player-battle
        :battle="battle"
        :player-tag="player.tag"
      ></player-battle>
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
      required: true
    },
    limit: {
      type: Number,
      required: false
    },
  },
})
</script>
