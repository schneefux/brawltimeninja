<template>
  <b-scrolling-dashboard>
    <template
      v-if="brawlerMetadata != undefined"
      v-for="prop in ['gadgets', 'starpowers'] as const"
      :key="prop"
    >
      <b-dashboard-cell
        :rows="1"
        :columns="3"
      >
        <brawler-accessory-stats-card
          :brawler-brawlstars-id="brawlerMetadata.brawlstarsId"
          :kind="prop"
        ></brawler-accessory-stats-card>
      </b-dashboard-cell>
    </template>

    <b-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <brawler-accessory-stats-card
        v-if="brawlerMetadata != undefined"
        :brawler-brawlstars-id="brawlerMetadata.brawlstarsId"
        kind="gears"
      ></brawler-accessory-stats-card>
    </b-dashboard-cell>

    <b-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <b-card :title="$t('info')">
        <template v-slot:content>
          <p>
            {{ $t('starpower-gadget-comparison.info') }}
          </p>
        </template>
      </b-card>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
  },
})
</script>
