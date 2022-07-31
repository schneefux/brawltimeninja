<template>
  <b-scrolling-dashboard>
    <b-dashboard-cell
      :rows="2"
      :columns="6"
      hide-empty
      lazy
    >
      <brawler-synergies-card
        :brawler="brawlerName"
      ></brawler-synergies-card>
    </b-dashboard-cell>
    <b-dashboard-cell
      :rows="2"
      :columns="6"
      hide-empty
      lazy
    >
      <brawler-weaknesses-card
        :brawler="brawlerName"
      ></brawler-weaknesses-card>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { BScrollingDashboard, BDashboardCell } from '@schneefux/klicker/components'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BScrollingDashboard,
    BDashboardCell,
  },
  props: {
    brawlerName: {
      type: String,
      required: true
    },
  },
})
</script>
