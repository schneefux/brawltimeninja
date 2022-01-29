<template>
  <div class="pt-2 w-full dashboard dashboard--responsive">
    <lazy
      v-for="(mode, index) in modes.slice(0, tease ? 3 : undefined)"
      :key="mode"
      :render="index <= 3"
      distance="600px"
      translucent
    >
      <player-mode-card
        :mode="mode"
        :battles="battles"
        :active-events="events"
        :player-brawlers="Object.values(player.brawlers)"
        :player-tag="player.tag"
        :enable-klicker-stats="enableKlickerStats"
        :elevation="elevation"
        :class="['dashboard__cell', {
          'hidden md:block': tease && index > 0,
        }]"
        style="--rows: 2; --columns: 3;"
      ></player-mode-card>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player, Battle } from '~/model/Api'
import { EventMetadata } from '~/plugins/klicker'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
    tease: {
      type: Boolean,
      default: false
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
    elevation: {
      type: Number
    },
  },
  data() {
    return {
      modes: [] as string[],
      events: [] as EventMetadata[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.modes = await this.$klicker.queryAllModes()
    this.events = await this.$klicker.queryActiveEvents()
  },
})
</script>
