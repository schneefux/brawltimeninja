<template>
  <b-page :title="$t('bar-chart-race.title')">
    <b-page-section :title="$t('bar-chart-race.howto.title')">
      <p class="prose dark:prose-invert">
        {{ $t('bar-chart-race.howto.description') }}
      </p>
    </b-page-section>

    <b-page-section :title="$t('bar-chart-race.note.title')">
      <p class="prose dark:prose-invert">
        {{ $t('bar-chart-race.note.description') }}
      </p>
      <q class="prose dark:prose-invert italic">{{ $t('attribution-example', { date: new Date().toDateString() }) }}</q>
    </b-page-section>

    <b-page-section :title="$t('bar-chart-race.brawler')">
      <c-dashboard
        v-model="query"
        :slicer-components="['s-season', 's-mode-map', 's-trophies', 's-powerplay', 's-competition-maps', 's-power']"
        :configurator="{
          configureMetrics: true,
          configureMetricsOptions: ['pickRate', 'useRate', 'winRate', 'winRateAdj', 'starRate'],
        }"
        class="mt-4"
        slicer
      >
        <template v-slot:totals="data">
          <c-dashboard-cell :columns="2">
            <v-sample-size
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-sample-size>
          </c-dashboard-cell>
          <c-dashboard-cell :columns="2">
            <v-last-update
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-last-update>
          </c-dashboard-cell>
        </template>

        <template v-slot:data="data">
          <c-dashboard-cell :rows="6" :columns="3">
            <v-table
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-table>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="2" :columns="3">
            <v-csv
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-csv>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="2" :columns="3">
            <v-pivot-csv
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-pivot-csv>
          </c-dashboard-cell>
        </template>
      </c-dashboard>
    </b-page-section>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, ref, useContext, useMeta } from '@nuxtjs/composition-api'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, BCard, CMetric, VTable, VCsv, VPivotCsv, BPageSection, CDashboardCell } from '@schneefux/klicker/components'
import { formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BPageSection,
    CDashboard,
    CDashboardCell,
    BCard,
    CMetric,
    VTable,
    VCsv,
    VPivotCsv,
  },
  head: {},
  meta: {
    title: 'Bar Chart Race',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  setup() {
    const query = ref<CubeQuery>({
      cubeId: 'battle',
      dimensionsIds: ['brawler', 'day'],
      metricsIds: ['useRate'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        mode: [],
        trophyRangeGte: ['0'],
        powerplay: [],
        mapLike: [],
        mapNotLike: [],
      },
      sortId: 'day',
    })

    const { i18n } = useContext()

    useMeta(() => {
      const description = i18n.t('bar-chart-race.meta.description') as string
      return {
        title: i18n.t('bar-chart-race.meta.title') as string,
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
