<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="{ brawler: [brawlerName.toUpperCase()] }"
        :dimensions="['day']"
        sort="day"
        metric="winRate"
      ></lazy-map-trend-chart>
    </c-dashboard-cell>

    <c-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="{ brawler: [brawlerName.toUpperCase()] }"
        :dimensions="['day']"
        sort="day"
        metric="starRate"
      ></lazy-map-trend-chart>
    </c-dashboard-cell>

    <c-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
        :dimensions="['day', 'brawler']"
        sort="day"
        metric="useRate"
        no-compare
      ></lazy-map-trend-chart>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent } from "@nuxtjs/composition-api"
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
