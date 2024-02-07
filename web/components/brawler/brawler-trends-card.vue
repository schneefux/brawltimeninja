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
        :slices="slices"
        :dimensions="['day']"
        sort="day"
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
        :slices="slices"
        :dimensions="['day']"
        sort="day"
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
        :filter="queryFilter"
        :dimensions="['day', 'brawler']"
        sort="day"
        metric="useRate"
        no-compare
      ></lazy-map-trend-chart>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { computed, defineAsyncComponent, defineComponent } from "vue"
import { BDashboardCell } from '@schneefux/klicker/components'

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
    const slices = computed(() => ({
      brawler: [props.brawlerBrawlstarsId],
    }))

    const queryFilter = (e: any) => e.dimensionsRaw.brawler.brawler == props.brawlerBrawlstarsId

    return {
      slices,
      queryFilter,
    }
  }
})
</script>
