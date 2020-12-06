<template>
  <page title="Brawl Stars Time Capsule">
    <p>See how the Meta evolved over time.</p>

    <page-section
      title="Game Mode Popularity"
      tracking-id="graph"
      page-tracking-id="meta_history"
    >
      <modes-over-time></modes-over-time>
    </page-section>

    <page-section
      title="State of the Meta"
      tracking-id="graph"
      page-tracking-id="meta_history"
    >
      <season-slider
        v-model="selectedSeason"
      ></season-slider>

      <map-detail-card
        :season="selectedSeason"
        class="mx-auto"
      ></map-detail-card>
    </page-section>
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
})
</script>
