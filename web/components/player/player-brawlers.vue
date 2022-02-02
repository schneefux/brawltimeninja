<template>
  <scrolling-dashboard
    :length="Object.values(player.brawlers).length"
  >
    <template v-slot="{ limit }">
      <lazy
        v-for="(brawler, id, index) in player.brawlers"
        :key="id"
        :render="index < 3"
        :class="{
          'lg:hidden': index >= limit,
        }"
        distance="200px"
        class="contents"
      >
        <div
          slot="placeholder"
          class="dashboard__cell"
          style="--rows: 2; --columns: 3;"
        ></div>
        <player-brawler-card
          :brawler="brawler"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
        ></player-brawler-card>
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
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
})
</script>
