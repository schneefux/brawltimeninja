<template>
  <b-page :title="$t('brawler-records.title')">
    <b-page-section :title="$t('info')">
      <p class="prose dark:prose-invert">
        {{ $t('brawler-records.info') }}
      </p>
    </b-page-section>

    <b-page-section :title="$t('brawler-records.players')">
      <c-dashboard
        v-model="query"
        :slicer-components="['s-season-exact', 's-brawler', 's-power']"
        slicer
      >
        <template v-slot:totals="data">
          <b-dashboard-cell :columns="2">
            <v-last-update
              v-bind="data"
              :card="{}"
            ></v-last-update>
          </b-dashboard-cell>
        </template>

        <template v-slot:data="data">
          <b-dashboard-cell :rows="8" :columns="3">
            <v-table
              v-bind="data"
              :card="{}"
            ></v-table>
          </b-dashboard-cell>
          <b-dashboard-cell :rows="2" :columns="3">
            <v-csv
              v-bind="data"
              :card="{}"
            ></v-csv>
          </b-dashboard-cell>
        </template>
      </c-dashboard>
    </b-page-section>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, BCard, CMetric, VTable, VCsv, BPageSection, BDashboardCell } from '@schneefux/klicker/components'
import { formatClickhouseDate, getTodaySeasonEnd } from '~/lib/util'
import { useI18n } from 'vue-i18n'
import { useCacheHeaders, useMeta } from '@/composables/compat'

export default defineComponent({
  components: {
    CDashboard,
    BDashboardCell,
    BPageSection,
    BCard,
    CMetric,
    VTable,
    VCsv,
  },
  setup() {
    const query = ref<CubeQuery>({
      cubeId: 'brawler',
      dimensionsIds: ['player', 'brawler'],
      metricsIds: ['highestTrophies'],
      slices: {
        season: [],
        seasonExact: [formatClickhouseDate(getTodaySeasonEnd())],
        brawler: [],
        powerGte: ['1'],
        powerLte: ['10'],
      },
      sortId: 'highestTrophies',
      limit: 100,
    })

    const i18n = useI18n()

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('brawler-records.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('brawler-records.meta.description') },
      ]
    }))

    return {
      query,
    }
  },
})
</script>
