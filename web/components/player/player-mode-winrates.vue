<template>
  <div>
    <scrolling-dashboard>
      <lazy
        v-for="(mode, index) in modes"
        :key="mode"
        :render="index <= 3"
        distance="600px"
        translucent
      >
        <div slot="placeholder"></div>
        <player-mode-card
          :mode="mode"
          :battles="battles"
          :active-events="events"
          :player-brawlers="Object.values(player.brawlers)"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
          :class="{
            'md:hidden': index >= (page + 1) * 3,
          }"
          class="dashboard__cell"
          style="--rows: 2; --columns: 4;"
        ></player-mode-card>
      </lazy>
    </scrolling-dashboard>

    <accordeon-buttons
      v-model="page"
      :pages="modes != undefined ? modes.length / 3 : 0"
      class="hidden md:flex"
    ></accordeon-buttons>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, useContext, useAsync } from '@nuxtjs/composition-api'
import { Player, Battle } from '~/model/Api'
import { EventMetadata } from '~/plugins/klicker'

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
  setup(props) {
    const { $klicker } = useContext()
    const modes = useAsync(() => $klicker.queryAllModes())
    const events = useAsync(() => $klicker.queryActiveEvents())

    const page = ref(0)

    return {
      modes,
      events,
      page,
    }
  },
})
</script>
