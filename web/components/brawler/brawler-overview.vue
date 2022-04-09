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
            :rows="overviewKvRows"
            :data="overviewKvData"
          >
            <b-select
              slot="level"
              v-model="level"
              class="!py-px !pr-8 leading-tight mx-1 my-[2px]"
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
      <brawler-attack-card
        v-if="scrapedData != undefined"
        :scraped-data="scrapedData"
        :prop="prop"
        :level="level"
      ></brawler-attack-card>
    </c-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useContext } from '@nuxtjs/composition-api'
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
  setup(props) {
    const level = ref('1')

    const { i18n } = useContext()
    const overviewKvRows = computed(() => props.scrapedData == undefined ? [] : [{
      title: i18n.t('metric.level'),
      key: 'level',
      slot: 'level',
    }, {
      title: i18n.t('metric.health'),
      key: `healthByLevel.${parseInt(level.value) - 1}`,
    }, ...Object.keys(props.scrapedData.stats).map((key) => ({
      title: i18n.t('metric.' + key),
      key,
    }))])

    const overviewKvData = computed(() => (props.scrapedData == undefined ? {} : {
      ...props.scrapedData.stats,
      level,
      healthByLevel: props.scrapedData.healthByLevel,
    }))

    return {
      level,
      overviewKvRows,
      overviewKvData,
    }
  },
})
</script>