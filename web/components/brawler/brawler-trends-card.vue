<template>
  <div class="dashboard dashboard--responsive dashboard--relaxed">
    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()] }"
      :dimensions="['day']"
      sort="day"
      metric="winRate"
      class="dashboard__cell"
      style="--rows: 2; --columns: 3;"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()] }"
      :dimensions="['day']"
      sort="day"
      metric="starRate"
      class="dashboard__cell"
      style="--rows: 2; --columns: 3;"
    ></map-trend-chart>

    <map-trend-chart
      :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
      :dimensions="['day', 'brawler']"
      sort="day"
      metric="useRate"
      class="dashboard__cell"
      style="--rows: 2; --columns: 3;"
      no-compare
    ></map-trend-chart>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api"

export default defineComponent({
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
})
</script>
