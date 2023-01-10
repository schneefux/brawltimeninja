<template>
  <b-scrolling-dashboard>
    <b-dashboard-cell
      :rows="2"
      :columns="4"
      hide-empty
      lazy
    >
      <lazy-map-trend-chart
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
        :filter="(e: any) => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
        :dimensions="['day', 'brawler']"
        sort="day"
        metric="useRate"
        no-compare
      ></lazy-map-trend-chart>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"
import { BDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BDashboardCell,
  },
  props: {
    brawlerName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const slices = computed(() => ({
      brawler: [props.brawlerName.toUpperCase()],
    }))

    return {
      slices,
    }
  }
})
</script>
