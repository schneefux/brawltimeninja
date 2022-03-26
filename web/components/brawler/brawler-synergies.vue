<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell :rows="2" :columns="6" hide-empty>
      <brawler-synergies-card
        :brawler="brawlerName"
      ></brawler-synergies-card>
    </c-dashboard-cell>
    <c-dashboard-cell :rows="2" :columns="6" hide-empty>
      <brawler-weaknesses-card
        :brawler="brawlerName"
      ></brawler-weaknesses-card>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { BScrollingDashboard, CDashboardCell } from '@schneefux/klicker/components'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
  },
  props: {
    brawlerName: {
      type: String,
      required: true
    },
  },
})
</script>
