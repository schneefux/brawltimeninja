<template>
  <page title="Brawl Stars Time Capsule">
    <p>See how the Meta evolved over time.</p>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'graph'),
        once: true,
      }"
    >
      <h2 class="page-h2">Game Mode Popularity</h2>
    </div>

    <div class="section flex justify-center">
      <modes-over-time
        class="w-full"
      ></modes-over-time>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'graph'),
        once: true,
      }"
    >
      <h2 class="page-h2">State of the Meta</h2>
    </div>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex flex-wrap justify-center"
    >
      <season-slider
        v-model="selectedSeason"
        class="w-full"
      ></season-slider>

      <map-detail-card
        :season="selectedSeason"
        class="mx-auto"
      ></map-detail-card>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      selectedSeason: undefined as string|undefined,
    }
  },
  middleware: ['cached'],
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  watch: {
    selectedSeason: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$ga.event('meta_history', 'scroll', section)
      }
    },
  },
})
</script>
