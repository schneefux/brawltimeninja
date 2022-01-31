<template>
  <div>
    <scrolling-dashboard>
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
            'md:hidden': index >= (page + 1) * 3,
          }"
          class="dashboard__cell"
          style="--rows: 2; --columns: 4;"
        ></player-battle>
      </lazy>
    </scrolling-dashboard>

    <accordeon-buttons
      v-model="page"
      :pages="player.battles.length / 3"
      class="hidden md:flex"
    ></accordeon-buttons>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'

export default defineComponent({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  setup(props) {
    const page = ref(0)

    return {
      page,
    }
  },
})
</script>
