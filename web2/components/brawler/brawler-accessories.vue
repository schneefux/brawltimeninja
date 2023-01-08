<template>
  <b-scrolling-dashboard>
    <template v-for="prop in ['gadgets', 'starpowers']">
      <template v-if="scrapedData != undefined">
        <b-dashboard-cell
          v-for="accessory in scrapedData[prop]"
          :key="prop + '-' + accessory.name"
          :rows="2"
          :columns="3"
        >
          <brawler-accessory-card
            :prop="prop"
            :accessory="accessory"
          ></brawler-accessory-card>
        </b-dashboard-cell>
      </template>

      <b-dashboard-cell
        v-else
        v-for="i in 2"
        :key="prop + '-' + i"
        :rows="2"
        :columns="3"
      ></b-dashboard-cell>
    </template>

    <b-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <b-card :title="$t('info')">
        <p slot="content">
          {{ $t('starpower-gadget-comparison.info') }}
        </p>
      </b-card>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, BDashboardCell, BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    BDashboardCell,
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
