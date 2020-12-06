<template>
  <div>
    <div class="overflow-x-auto flex md:flex-wrap md:justify-center">
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
    </div>

    <div class="mt-2 w-full text-right hidden md:block">
      <button
        v-show="!showAllModes"
        class="button button--md button--secondary"
        @click="showAllModes = true; $ga.event('brawler_meta', 'load_more')"
      >
        Show All Modes
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  data() {
    return {
      modes: [] as string[],
      showAllModes: false,
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.modes = await this.$clicker.queryAllModes()
  },
})
</script>
