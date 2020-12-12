<template>
  <div
    :class="['flex flex-wrap justify-center pt-2', {
      'h-72 overflow-y-hidden': tease,
    }]"
  >
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
        :active-map-meta="activeMapMeta"
        :player-brawlers="Object.values(player.brawlers)"
        :player-tag="player.tag"
        :enable-clicker-stats="enableClickerStats"
        elevation="2"
        sm
      ></player-mode-card>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player, Battle } from '~/model/Api'
import { MapMetaMap } from '~/model/MetaEntry'

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
    activeMapMeta: {
      type: Object as PropType<MapMetaMap>,
      default: {}
    },
    tease: {
      type: Boolean,
      default: false
    },
    enableClickerStats: {
      type: Boolean,
      required: true
    },
  },
  data() {
    return {
      modes: [] as string[],
    }
  },
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
  },
})
</script>
