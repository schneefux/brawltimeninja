<template>
  <split-page :title="$t(`tier-list.${singular}.title`)">
    <breadcrumbs
      id="breadcrumbs"
      :links="[{
        path: '/tier-list/brawler',
        name: $t('brawler', 2),
      }, {
        path: `/tier-list/${plural}`,
        name: $t(singular, 2),
      }]"
    ></breadcrumbs>

    <p id="description" class="mt-4 prose dark:prose-invert">
      {{ $t(`tier-list.${singular}.description`) }}
    </p>

    <gadget-starpower-disclaimer
      id="disclaimer"
      class="mt-4"
    ></gadget-starpower-disclaimer>

    <ad kind="first"></ad>

    <b-page-section id="dashboard" :title="$t(`tier-list.${singular}.${plural}`)">
      <c-dashboard
        v-model="query"
        :slicer-components="['s-season', 's-mode-map', 's-trophies', 's-powerplay', 's-competition-maps']"
        :configurator="{
          configureMetrics: true,
          configureMetricsOptions: ['picks', 'wins', 'winRate', 'winRateAdj', 'starRate', 'rank'],
        }"
        class="mt-4"
        sync-slices
        slicer
      >
        <template v-slot:totals="data">
          <b-dashboard-cell :columns="2">
            <v-sample-size
              v-bind="data"
              card
            ></v-sample-size>
          </b-dashboard-cell>
          <b-dashboard-cell :columns="2">
            <v-last-update
              v-bind="data"
              card
            ></v-last-update>
          </b-dashboard-cell>
        </template>

        <template v-slot:data="data">
          <b-dashboard-cell :rows="5" :columns="4">
            <v-table
              v-bind="data"
              link-path="/dashboard"
              card
            ></v-table>
          </b-dashboard-cell>
          <b-dashboard-cell :rows="5" :columns="9">
            <v-barplot
              v-bind="data"
              card
            ></v-barplot>
          </b-dashboard-cell>
          <b-dashboard-cell :rows="3" :columns="3">
            <v-test-info
              v-bind="data"
              card
            ></v-test-info>
          </b-dashboard-cell>
        </template>
      </c-dashboard>
    </b-page-section>
  </split-page>
</template>

<script lang="ts">
import { CubeComparingQuery } from '@schneefux/klicker/types'
import { defineComponent, computed, ref, PropType } from 'vue'
import { CDashboard, CMetric, VTable, VBarplot, BCard, VTestInfo, BDashboardCell } from '@schneefux/klicker/components'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BCard,
    CDashboard,
    BDashboardCell,
    CMetric,
    VTable,
    VBarplot,
    VTestInfo,
  },
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'|'gears'>,
      required: true
    }
  },
  setup(props) {
    const keys = {
      'gears': 'gear',
      'gadgets': 'gadget',
      'starpowers': 'starpower',
    }

    const singular = computed(() => keys[props.kind])
    const plural = computed(() => props.kind)

    const query = ref<CubeComparingQuery>({
      cubeId: 'battle',
      dimensionsIds: props.kind == 'gears' ? [singular.value] : ['brawler', singular.value],
      metricsIds: ['winRate'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        [singular.value + 'IdNeq']: ['0'],
      },
      sortId: 'winRate',
      comparing: true,
      reference: {
        cubeId: 'battle',
        dimensionsIds: props.kind == 'gears' ? [] : ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          season: [formatClickhouseDate(getMonthSeasonEnd())],
          [plural.value + 'Length']: ['0'], // exclude where no accessory identified
        },
        sortId: 'winRate',
      },
    })

    return {
      query,
      plural,
      singular,
    }
  },
})
</script>
