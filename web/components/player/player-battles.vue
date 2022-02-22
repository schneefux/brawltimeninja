<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell
      v-for="(battle, index) in player.battles"
      :key="battle.timestamp"
      :columns="4"
      :rows="2"
      :lazy="index > 3"
      :ssr-key="`player-battles-${battle.timestamp}`"
    >
      <player-battle
        :battle="battle"
        :player-tag="player.tag"
      ></player-battle>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
})
</script>
