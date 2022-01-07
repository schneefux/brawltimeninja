<template>
  <div class="md:flex md:flex-wrap md:justify-center">
    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
      :dimensions="['trophyRange']"
      sort="trophyRange"
      metric="winRate"
      class="w-full md:w-120 h-64"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
      :dimensions="['trophyRange']"
      sort="trophyRange"
      metric="starRate"
      class="w-full md:w-120 h-64"
    ></map-trend-chart>

    <map-trend-chart
      :slices="{ powerplay: ['false'] }"
      :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
      :dimensions="['trophyRange', 'brawler']"
      sort="trophyRange"
      metric="useRate"
      class="w-full md:w-120 h-64"
      no-compare
    ></map-trend-chart>
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
