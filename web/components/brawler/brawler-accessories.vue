<template>
  <b-scrolling-dashboard>
    <template v-for="prop in ['gadgets', 'starpowers']">
      <template v-if="scrapedData != undefined">
        <c-dashboard-cell
          v-for="accessory in scrapedData[prop]"
          :key="prop + '-' + accessory.name"
          :rows="2"
          :columns="3"
        >
          <brawler-accessory-card
            :prop="prop"
            :accessory="accessory"
          ></brawler-accessory-card>
        </c-dashboard-cell>
      </template>

      <c-dashboard-cell
        v-else
        v-for="i in 2"
        :key="prop + '-' + i"
        :rows="2"
        :columns="3"
      ></c-dashboard-cell>
    </template>

    <c-dashboard-cell
      :rows="2"
      :columns="3"
    >
      <b-card :title="$t('info')">
        <p slot="content">
          {{ $t('starpower-gadget-comparison.info') }}
        </p>
      </b-card>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, CDashboardCell, BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
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
