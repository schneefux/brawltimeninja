<template>
  <scrolling-dashboard
    v-if="modes != undefined"
    :length="modes.length"
  >
    <template v-slot="{ limit }">
      <lazy
        v-for="(mode, index) in modes"
        :key="mode"
        :render="index <= 3"
        :class="{
          'lg:hidden': index >= limit,
        }"
        distance="600px"
        class="dashboard__cell"
        style="--rows: 2; --columns: 4;"
      >
        <player-mode-card
          :mode="mode"
          :battles="battles"
          :active-events="events"
          :player-brawlers="Object.values(player.brawlers)"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
          :class="{
            'lg:hidden': index >= limit,
          }"
        ></player-mode-card>
      </lazy>
    </template>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext, useAsync } from '@nuxtjs/composition-api'
import { Player, Battle } from '~/model/Api'

export default defineComponent({
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
