<template>
  <b-scrolling-dashboard>
    <b-dashboard-cell
      :rows="2"
      :columns="6"
      hide-empty
      lazy
    >
      <brawler-synergies-card
        v-if="brawlerMetadata"
        :brawler-metadata="brawlerMetadata"
      ></brawler-synergies-card>
    </b-dashboard-cell>
    <b-dashboard-cell
      :rows="2"
      :columns="6"
      hide-empty
      lazy
    >
      <brawler-weaknesses-card
        v-if="brawlerMetadata"
        :brawler-metadata="brawlerMetadata"
      ></brawler-weaknesses-card>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { BScrollingDashboard, BDashboardCell } from '@schneefux/klicker/components'
import { PropType } from 'vue';
import { defineComponent } from 'vue'
import { BrawlerMetadata } from '~/composables/dimension-values';

export default defineComponent({
  components: {
    BScrollingDashboard,
    BDashboardCell,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: false
    },
  },
})
</script>
