<template>
  <b-card>
    <template v-slot:content>
      <b-scrolling-dashboard>
        <template v-if="scrapedData != undefined">
          <b-dashboard-cell
            v-for="pin in scrapedData.pins"
            :key="pin.name"
            :rows="1"
            :columns="1"
          >
            <brawler-pin :pin="pin"></brawler-pin>
          </b-dashboard-cell>
        </template>
        <b-dashboard-cell
          v-else
          v-for="i in 8"
          :key="i"
          :rows="1"
          :columns="1"
        ></b-dashboard-cell>
      </b-scrolling-dashboard>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, BDashboardCell, BCard, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    BDashboardCell,
    BButton,
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
})
</script>
