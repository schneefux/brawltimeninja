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
  },
  data() {
    return {
      modes: [] as string[],
    }
  },
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
  },
});
</script>
