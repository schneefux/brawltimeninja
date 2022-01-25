<template>
  <div>
    <b-horizontal-scroller expand-on-desktop>
      <div
        v-for="(mode, index) in modes"
        :key="mode"
        :class="{ 'md:hidden': !showAllModes && index >= 3 }"
        class="mx-2"
      >
        <map-best-brawlers-card
          :slices="{ mode: [mode] }"
        ></map-best-brawlers-card>
      </div>
    </b-horizontal-scroller>

    <div
      v-show="!showAllModes"
      class="mt-2 w-full text-right hidden md:block"
    >
      <b-button
        sm
        primary
        @click="expandModes()"
      >
        {{ $t('action.show-all.modes')}}
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { BHorizontalScroller } from 'klicker'

export default Vue.extend({
  components: {
    BHorizontalScroller,
  },
  data() {
    return {
      modes: ['brawlBall'] as string[],
      showAllModes: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.modes = await this.$klicker.queryAllModes()
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
