<template>
  <div>
    <scrolling-dashboard>
      <lazy
        v-for="(brawler, index) in Object.values(player.brawlers)"
        :key="brawler.id"
        :render="index < 3"
        :class="{
          'md:hidden': index >= (page + 1) * 3,
        }"
        distance="200px"
        translucent
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
    </scrolling-dashboard>

    <accordeon-buttons
      v-model="page"
      :pages="Object.values(player.brawlers).length / 3"
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
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup() {
    const page = ref(0)

    return {
      page,
    }
  },
})
</script>
