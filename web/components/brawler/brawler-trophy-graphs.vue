<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell :rows="2" :columns="4" hide-empty>
      <map-trend-chart
        :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
        :dimensions="['trophyRange']"
        cube-id="map"
        sort="trophyRange"
        metric="winRate"
      ></map-trend-chart>
    </c-dashboard-cell>

    <c-dashboard-cell :rows="2" :columns="4" hide-empty>
      <map-trend-chart
        :slices="{ brawler: [brawlerName.toUpperCase()], powerplay: ['false'] }"
        :dimensions="['trophyRange']"
        cube-id="map"
        sort="trophyRange"
        metric="starRate"
      ></map-trend-chart>
    </c-dashboard-cell>

    <c-dashboard-cell :rows="2" :columns="4" hide-empty>
      <map-trend-chart
        :slices="{ powerplay: ['false'] }"
        :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
        :dimensions="['trophyRange', 'brawler']"
        cube-id="map"
        sort="trophyRange"
        metric="useRate"
        no-compare
      ></map-trend-chart>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api";
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
})
</script>
