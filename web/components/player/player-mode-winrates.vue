<template>
  <scrolling-dashboard
    v-if="modes != undefined"
    :length="modes.length"
  >
    <template v-slot="{ limit }">
      <c-dashboard-cell
        v-for="(mode, index) in modes"
        :key="mode"
        :rows="2"
        :columns="4"
        :class="{
          'lg:hidden': index >= limit,
        }"
        :lazy="index > 3"
      >
        <player-mode-card
          :mode="mode"
          :battles="battles"
          :active-events="events"
          :player-brawlers="Object.values(player.brawlers)"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
        ></player-mode-card>
      </c-dashboard-cell>
    </template>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext, useAsync } from '@nuxtjs/composition-api'
import { Player, Battle } from '~/model/Api'
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
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup() {
    const { $klicker } = useContext()
    const modes = useAsync(() => $klicker.queryAllModes())
    const events = useAsync(() => $klicker.queryActiveEvents())

    return {
      modes,
      events,
    }
  },
})
</script>
