<template>
  <b-scrolling-dashboard>
    <c-dashboard-cell
      :rows="3"
      :columns="4"
    >
      <b-card
        v-if="scrapedData != undefined"
        :icon="`/brawlers/${brawlerId}/avatar`"
        :icon-alt="$t('brawler.avatar', { brawler: scrapedData.name })"
        :title="$t('brawler.statistics', { brawler: '' })"
        full-height
      >
        <template v-slot:icon="data">
          <media-img-icon v-bind="data"></media-img-icon>
        </template>

        <div
          slot="content"
          class="h-full flex flex-col justify-between gap-y-4"
        >
          <p>
            <q class="italic">{{ scrapedData.description }}</q>
          </p>
          <b-kv-table
            :rows="[{
              title: $t('metric.level'),
              key: 'level',
              slot: 'level',
            }, {
              title: $t('metric.health'),
              key: `healthByLevel.${level - 1}`,
            }, ...Object.keys(scrapedData.stats).map((key) => ({
              title: $t('metric.' + key),
              key,
            }))]"
            :data="{
              ...scrapedData.stats,
              level,
              healthByLevel: scrapedData.healthByLevel,
            }"
          >
            <b-select
              slot="level"
              v-model="level"
              class="!py-px !pr-8 leading-tight"
            >
              <option
                v-for="i in 11"
                :key="i"
                :value="i"
              >{{ i }}</option>
            </b-select>
          </b-kv-table>
        </div>
      </b-card>
    </c-dashboard-cell>

    <c-dashboard-cell
      v-for="prop in ['attack', 'super']"
      :key="prop"
      :rows="3"
      :columns="4"
    >
      <b-card
        v-if="scrapedData != undefined"
        :icon="require(`~/assets/images/${prop}-icon.png`)"
        :icon-alt="`${prop} Icon`"
        :title="scrapedData[prop].name"
        full-height
      >
        <div
          slot="content"
          class="h-full flex flex-col justify-between gap-y-4"
        >
          <p>
            <q class="italic">{{ scrapedData[prop].description }}</q>
          </p>
          <b-kv-table
            :rows="[
              ...scrapedData[prop].statsByLevel.map((attack, index) => ({
                title: attack.name,
                key: `statsByLevel.${index}.list.${level - 1}`,
              })),
              ...Object.keys(scrapedData[prop].stats).map((key) => ({
                title: $t('metric.' + key.replace(prop, '')),
                key,
              })),
            ]"
            :data="{
              ...scrapedData[prop].stats,
              statsByLevel: scrapedData[prop].statsByLevel,
            }"
          ></b-kv-table>
        </div>
      </b-card>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from '@nuxtjs/composition-api'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingDashboard, CDashboardCell, BCard, BKvTable, BSelect } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
    BKvTable,
    BSelect,
    BCard,
  },
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
  setup() {
    const level = ref(1)

    return {
      level,
    }
  },
})
</script>