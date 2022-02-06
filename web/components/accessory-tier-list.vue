<template>
  <div>
    <breadcrumbs
      :links="[{
        path: '/tier-list/brawler',
        name: $tc('brawler', 2),
      }, {
        path: `/tier-list/${plural}`,
        name: $tc(singular, 2),
      }]"
      class="mt-4"
    ></breadcrumbs>

    <p class="mt-4 prose prose-invert">
      {{ $t(`tier-list.${singular}.description`) }}
    </p>

    <gadget-starpower-disclaimer
      class="mt-4"
    ></gadget-starpower-disclaimer>

    <page-section :title="$t(`tier-list.${singular}.${plural}`)">
      <c-dashboard
        v-model="query"
        :slicer-components="['s-season', 's-mode-map', 's-trophies', 's-powerplay', 's-competition-maps']"
        :configurator="{
          configureMetrics: true,
          configureMetricsOptions: ['picks', 'wins', 'winRate', 'winRateAdj', 'starRate', 'rank'],
        }"
        dashboard-class="dashboard--responsive dashboard--responsive-stretch"
        class="mt-4"
        sync-slices
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
          <c-dashboard-cell :rows="5" :columns="4">
            <v-table
              v-bind="data"
              :card="{ fullHeight: true }"
              link-path="/dashboard"
            >
              <template v-slot:dimensions="data">
                <d-brawler v-bind="data"></d-brawler>
                <d-gear v-bind="data"></d-gear>
              </template>
            </v-table>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="5" :columns="9">
            <v-barplot
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-barplot>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="3" :columns="3">
            <v-test-info
              v-bind="data"
              :card="{ fullHeight: true }"
            ></v-test-info>
          </c-dashboard-cell>
        </template>
      </c-dashboard>
    </page-section>
  </div>
</template>

<script lang="ts">
import { CubeComparingQuery } from '@schneefux/klicker/types'
import { defineComponent, computed, ref, PropType } from '@nuxtjs/composition-api'
import { CDashboard, CMetric, VTable, VBarplot, BCard, VTestInfo, CDashboardCell } from '@schneefux/klicker/components'
import { getSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BCard,
    CDashboard,
    CDashboardCell,
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
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    const keys = {
      'gears': 'gear',
      'gadgets': 'gadget',
      'starpowers': 'starpower',
    }

    const singular = computed(() => keys[props.kind])
    const plural = props.kind

    const query = ref<CubeComparingQuery>({
      cubeId: 'battle',
      dimensionsIds: props.kind == 'gears' ? [singular.value] : ['brawler', singular.value],
      metricsIds: ['winRate'],
      slices: {
        season: [currentSeason.toISOString().slice(0, 10)],
        [singular.value + 'IdNeq']: ['0'],
      },
      sortId: 'winRate',
      comparing: true,
      reference: {
        cubeId: 'battle',
        dimensionsIds: props.kind == 'gears' ? [] : ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          [singular.value + 'IdEq']: ['0'],
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
