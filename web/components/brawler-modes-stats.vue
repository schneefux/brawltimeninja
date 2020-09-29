<template>
  <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
    <lazy
      v-for="(mode, index) in modes"
      :key="mode.battle_event_mode"
      :render="showAllModes || index <= 2"
      :class="{
        'md:hidden': !showAllModes && index > 2,
        'mx-4': true,
      }"
      distance="600px"
    >
      <div class="w-80" style="height: 221px" slot="placeholder"></div>
      <brawler-mode-stats
        :mode="mode"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        :total-brawlers="totalBrawlers"
      ></brawler-mode-stats>
    </lazy>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    showAllModes: {
      type: Boolean,
      default: false
    },
    totalBrawlers: {
      type: Number,
      required: true
    },
  },
  data() {
    return {
      modes: [] as string[],
    }
  },
  async fetch() {
    const modes = await this.$clicker.query('all.modes', 'map',
      ['battle_event_mode'],
      ['battle_event_mode'],
      { trophy_season_end: ['balance'] },
      { cache: 60*60*24 })
    this.modes = modes.data.map(row => row.battle_event_mode)
  },
});
</script>
