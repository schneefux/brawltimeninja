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
          <c-dashboard-cell :columns="2">
            <v-last-update
              v-bind="data"
              card
            ></v-last-update>
          </c-dashboard-cell>
        </template>

        <template v-slot:data="data">
          <c-dashboard-cell :rows="8" :columns="3">
            <v-table
              v-bind="data"
              card
            ></v-table>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="2" :columns="3">
            <v-csv
              v-bind="data"
              card
            ></v-csv>
          </c-dashboard-cell>
        </template>
      </c-dashboard>
    </b-page-section>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, useMeta } from '@nuxtjs/composition-api'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, BCard, CMetric, VTable, VCsv, BPageSection, CDashboardCell } from '@schneefux/klicker/components'
import { formatClickhouseDate, getTodaySeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    CDashboard,
    CDashboardCell,
    BPageSection,
    BCard,
    CMetric,
    VTable,
    VCsv,
  },
  head: {},
  middleware: ['cached'],
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

    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('brawler-records.meta.description') as string
      return {
        title: i18n.t('brawler-records.meta.title') as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    return {
      query,
    }
  },
})
</script>
