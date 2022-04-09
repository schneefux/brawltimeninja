<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell
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
    </c-dashboard-cell>

    <c-dashboard-cell
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
    </c-dashboard-cell>

    <c-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
        :slices="{ powerplay: ['false'] }"
        :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
        :dimensions="['trophyRange', 'brawler']"
        cube-id="map"
        sort="trophyRange"
        metric="useRate"
        no-compare
      ></lazy-map-trend-chart>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent } from "@nuxtjs/composition-api";
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
  setup(props) {
    const brawlerSlices = computed(() => ({
      brawler: [props.brawlerName.toUpperCase()],
      powerplay: ['false'],
    }))

    return {
      brawlerSlices,
    }
  }
})
</script>
