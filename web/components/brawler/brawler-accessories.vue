<template>
  <b-scrolling-dashboard>
    <template
      v-for="prop in ['gadgets', 'starpowers']"
      :key="prop"
    >
      <template v-if="scrapedData != undefined">
        <b-dashboard-cell
          v-for="accessory in scrapedData[prop as 'gadgets'|'starpowers']"
          :key="accessory.name"
          :rows="1"
          :columns="3"
        >
          <brawler-accessory-card
            :prop="prop as 'gadgets'|'starpowers'"
            :accessory="accessory"
          ></brawler-accessory-card>
        </b-dashboard-cell>
      </template>

      <b-dashboard-cell
        v-else
        v-for="i in 2"
        :key="prop + '-' + i"
        :rows="1"
        :columns="3"
      ></b-dashboard-cell>
    </template>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, BDashboardCell, BCard } from '@schneefux/klicker/components'
import { BrawlerMetadata } from '~/composables/dimension-values';

export default defineComponent({
  components: {
    BScrollingDashboard,
    BDashboardCell,
    BCard,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: false
    },
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
})
</script>
