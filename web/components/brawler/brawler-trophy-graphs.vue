<template>
  <scrolling-dashboard>
    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
      :dimensions="['trophyRange']"
      sort="trophyRange"
      metric="winRate"
      class="dashboard__cell dashboard__cell--hide-empty"
      style="--rows: 2; --columns: 4;"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
      :dimensions="['trophyRange']"
      sort="trophyRange"
      metric="starRate"
      class="dashboard__cell dashboard__cell--hide-empty"
      style="--rows: 2; --columns: 4;"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ powerplay: ['false'] }"
      :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
      :dimensions="['trophyRange', 'brawler']"
      sort="trophyRange"
      metric="useRate"
      class="dashboard__cell dashboard__cell--hide-empty"
      style="--rows: 2; --columns: 4;"
      no-compare
    ></map-trend-chart>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
})
</script>
