<template>
  <scrolling-dashboard
    :length="player.battles.length"
  >
    <template v-slot="{ limit }">
      <lazy
        v-for="(battle, index) in player.battles"
        :key="battle.timestamp"
        :render="index <= 3"
        distance="640px"
        translucent
      >
        <div slot="placeholder"></div>
        <player-battle
          :battle="battle"
          :player-tag="player.tag"
          :class="{
            'lg:hidden': index >= limit,
          }"
          class="dashboard__cell"
          style="--rows: 2; --columns: 4;"
        ></player-battle>
      </lazy>
    </template>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'

export default defineComponent({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
})
</script>
