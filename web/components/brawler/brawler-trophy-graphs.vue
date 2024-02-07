<template>
  <b-scrolling-dashboard>
    <b-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        v-if="brawlerBrawlstarsId != undefined"
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
        v-if="brawlerBrawlstarsId != undefined"
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
        v-if="brawlerBrawlstarsId != undefined"
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
import { CubeQueryFilter } from "@schneefux/klicker/types";

export default defineComponent({
  components: {
    BDashboardCell,
    LazyMapTrendChart: defineAsyncComponent(() => import('~/components/map/map-trend-chart.vue'))
  },
  props: {
    brawlerBrawlstarsId: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const brawlerSlices = computed(() => ({
      brawler: [props.brawlerBrawlstarsId],
      powerplay: ['false'],
    }))

    const filter = computed<CubeQueryFilter>(() => (e) => e.dimensionsRaw.brawler.brawler == props.brawlerBrawlstarsId)

    return {
      filter,
      brawlerSlices,
    }
  }
})
</script>
