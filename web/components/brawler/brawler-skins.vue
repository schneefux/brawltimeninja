<template>
  <b-scrolling-dashboard>
    <template v-if="scrapedData != undefined">
      <template v-for="skinList in scrapedData.skins">
        <c-dashboard-cell
          v-for="skin in skinList.skins"
          :key="`${skinList.name}-${skin.name}`"
          :rows="3"
          :columns="2"
        >
          <b-card
            :title="skin.name"
            full-height
          >
            <div
              slot="content"
              class="h-full flex flex-col items-center justify-between"
            >
              <media-img
                :path="encodeURIComponent(skin.path).replaceAll('%2F', '/').replace(/\.(png|gif)/, '')"
                :alt="skin.name"
                clazz="max-h-48"
                size="400"
                loading="lazy"
              ></media-img>
              <b-kv-table
                :rows="[{
                  title: $t('brawler.skin.cost'),
                  key: 'cost',
                }, {
                  title: $t('brawler.skin.campaign'),
                  key: `campaign`,
                }]"
                :data="skin"
                class="w-full mt-4"
              ></b-kv-table>
            </div>
          </b-card>
        </c-dashboard-cell>
      </template>
    </template>
    <c-dashboard-cell
      v-else
      v-for="i in 2"
      :key="i"
      :rows="3"
      :columns="2"
    ></c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, CDashboardCell, BCard, BKvTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
    BKvTable,
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
