<template>
  <b-card>
    <b-scrolling-dashboard slot="content">
      <template v-if="scrapedData != undefined">
        <b-dashboard-cell
          v-for="pin in scrapedData.pins"
          :key="pin.name"
          :rows="1"
          :columns="1"
        >
          <div class="h-full flex flex-col items-center justify-center relative">
            <media-img
              :path="pin.path.replace(/\.(png|gif)/, '')"
              :alt="pin.name"
              :animated="pin.path.endsWith('.gif')"
              clazz="max-h-20"
              size="160"
              loading="lazy"
            ></media-img>
          </div>
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
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
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
