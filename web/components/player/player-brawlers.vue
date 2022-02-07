<template>
  <scrolling-dashboard
    :length="Object.values(player.brawlers).length"
    :page-size="4"
  >
    <template v-slot="{ limit }">
      <c-dashboard-cell
        v-for="(brawler, id, index) in player.brawlers"
        :key="id"
        :rows="3"
        :columns="3"
        :lazy="index > 4"
        :class="{
          'lg:hidden': index >= limit,
        }"
        :ssr-key="`player-brawlers-${id}`"
      >
        <player-brawler-card
          :brawler="brawler"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
        ></player-brawler-card>
      </c-dashboard-cell>
    </template>
  </scrolling-dashboard>
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
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
})
</script>
