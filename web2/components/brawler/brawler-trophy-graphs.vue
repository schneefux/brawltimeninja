<template>
  <b-scrolling-dashboard>
    <b-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="brawlerSlices"
        :dimensions="['trophyRange']"
        cube-id="map"
        sort="trophyRange"
        metric="winRate"
      ></lazy-map-trend-chart>
    </b-dashboard-cell>

    <b-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="brawlerSlices"
        :dimensions="['trophyRange']"
        cube-id="map"
        sort="trophyRange"
        metric="starRate"
      ></lazy-map-trend-chart>
    </b-dashboard-cell>

    <b-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="{ powerplay: ['false'] }"
        :filter="filter"
        :dimensions="['trophyRange', 'brawler']"
        cube-id="map"
        sort="trophyRange"
        metric="useRate"
        no-compare
      ></lazy-map-trend-chart>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent } from "vue";
import { BDashboardCell } from '@schneefux/klicker/components'
import { MetaGridEntry } from "@schneefux/klicker/types";

export default defineComponent({
  components: {
    BDashboardCell,
    LazyMapTrendChart: defineAsyncComponent(() => import('~/components/map/map-trend-chart.vue'))
  },
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const brawlerSlices = computed(() => ({
      brawler: [props.brawlerName.toUpperCase()],
      powerplay: ['false'],
    }))

    const filter = computed(() => (e: MetaGridEntry) => e.dimensionsRaw.brawler.brawler == props.brawlerName.toUpperCase())

    return {
      filter,
      brawlerSlices,
    }
  }
})
</script>
