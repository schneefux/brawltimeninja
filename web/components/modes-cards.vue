<template>
  <div>
    <horizontal-scroller expand-on-desktop>
      <div
        v-for="(mode, index) in modes"
        :key="mode"
        :class="{ 'md:hidden': !showAllModes && index >= 3 }"
        class="mx-2"
      >
        <map-best-brawlers-card
          :mode="mode"
          link
        ></map-best-brawlers-card>
      </div>
    </horizontal-scroller>

    <div class="mt-2 w-full text-right hidden md:block">
      <b-button
        v-if="!showAllModes"
        md
        secondary
        @click="expandModes()"
      >
        Show All Modes
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      modes: ['brawlBall'] as string[],
      showAllModes: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
  },
  methods: {
    expandModes() {
      this.showAllModes = true
      this.$gtag.event('load_more', {
        'event_category': 'brawler_meta',
      })
    },
  },
})
</script>
