<template>
  <div class="md:flex md:flex-wrap md:justify-center">
    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()] }"
      metric="winRate"
      dimension="trophyRange"
      class="w-full md:w-120 h-64"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()] }"
      metric="starRate"
      dimension="trophyRange"
      class="w-full md:w-120 h-64"
    ></map-trend-chart>

    <!-- TODO Use Rate chart -->
  </div>
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
