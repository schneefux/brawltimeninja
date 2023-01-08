<template>
  <c-dashboard
    v-model="query"
    :elevation="1"
    :slicer-components="['s-season', 's-trophies', 's-powerplay']"
    class="lg:justify-center"
    slicer
  >
    <template v-slot:totalsQuery="totalsQuery">
      <b-scrolling-list
        :items="[{ component: 'v-sample-size' }, { component: 'v-last-update' }, { component: 'v-moe' }]"
        :cell-rows="1"
        :cell-columns="2"
        :render-at-least="3"
        key-id="component"
        render-placeholder
      >
        <template v-slot:item="component">
          <c-query :query="totalsQuery">
            <template v-slot="data">
              <component
                :is="component.component"
                v-bind="data"
                card
              ></component>
            </template>
          </c-query>
        </template>
      </b-scrolling-list>
    </template>

    <template v-slot:query="query">
      <b-tabs
        :tabs="tabs"
        nav-class="top-14 lg:top-0 z-20"
        class="mt-8"
      >
        <b-dashboard
          slot="brawlers"
          class="lg:dashboard--margin-2"
          responsive
        >
          <b-dashboard-cell
            :columns="4"
            :rows="5"
            hide-empty
          >
            <map-best-brawlers-table
              v-observe-visibility="{
                callback: makeVisibilityCallback('brawlers'),
                once: true,
              }"
              :id="id"
              :slices="slices"
            ></map-best-brawlers-table>
          </b-dashboard-cell>

          <b-dashboard-cell
            v-if="mode != 'soloShowdown' && mode != 'duels'"
            :columns="4"
            :rows="5"
            hide-empty
          >
            <map-best-teams-table
              v-observe-visibility="{
                callback: makeVisibilityCallback('teams'),
                once: true,
              }"
              :id="id"
              :slices="slices"
            ></map-best-teams-table>
          </b-dashboard-cell>

          <ad-cell
            :columns="3"
            :rows="2"
            ad-slot="4623162753"
          ></ad-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="slices"
            tab="brawlers"
          ></map-insights>

          <map-balance-chart
            :id="id"
            :slices="slices"
            v-observe-visibility="{
              callback: makeVisibilityCallback('charts'),
              once: true,
            }"
          ></map-balance-chart>

          <b-dashboard-cell
            :columns="5"
            :rows="4"
            ssr-key="map-winrate-userate-chart"
            hide-empty
            lazy
          >
            <map-winrate-userate-chart
              :id="id"
              :slices="slices"
            ></map-winrate-userate-chart>
          </b-dashboard-cell>

          <b-dashboard-cell
            :columns="6"
            :rows="4"
            ssr-key="map-trend-chart"
            hide-empty
            lazy
          >
            <map-trend-chart
              :id="id"
              :slices="slices"
            ></map-trend-chart>
          </b-dashboard-cell>

          <b-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <metric-info :metric="adjustedWinRate"></metric-info>
          </b-dashboard-cell>
        </b-dashboard>

        <b-dashboard
          slot="leaderboard"
          responsive
        >
          <b-dashboard-cell
            :columns="4"
            :rows="5"
            ssr-key="map-best-players-table"
            hide-empty
            lazy
          >
            <map-best-players-table
              v-observe-visibility="{
                callback: makeVisibilityCallback('leaderboard'),
                once: true,
              }"
              :id="id"
              :slices="slices"
            ></map-best-players-table>
          </b-dashboard-cell>

          <ad-cell
            :columns="8"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </b-dashboard>

        <b-dashboard
          slot="starpowers"
          responsive
        >
          <b-dashboard-cell
            :columns="4"
            :rows="5"
            ssr-key="map-best-starpowers-table"
            hide-empty
            lazy
          >
            <map-best-accessory-table
              key="starpowers-table"
              v-observe-visibility="{
                callback: makeVisibilityCallback('starpowers'),
                once: true,
              }"
              :id="id"
              :slices="slices"
              kind="starpowers"
            ></map-best-accessory-table>
          </b-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="slices"
            tab="starpowers"
          ></map-insights>

          <b-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </b-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </b-dashboard>

        <b-dashboard
          slot="gadgets"
          responsive
        >
          <b-dashboard-cell
            :columns="4"
            :rows="5"
            ssr-key="map-best-gadgets-table"
            hide-empty
            lazy
          >
            <map-best-accessory-table
              key="gadgets-table"
              v-observe-visibility="{
                callback: makeVisibilityCallback('gadgets'),
                once: true,
              }"
              :id="id"
              :slices="slices"
              kind="gadgets"
            ></map-best-accessory-table>
          </b-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="slices"
            tab="gadgets"
          ></map-insights>

          <b-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </b-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </b-dashboard>

        <b-dashboard
          slot="gears"
          responsive
        >
          <b-dashboard-cell
            :columns="5"
            :rows="2"
            ssr-key="map-best-gears-table"
            hide-empty
            lazy
          >
            <map-best-accessory-roll
              v-observe-visibility="{
                callback: makeVisibilityCallback('gears'),
                once: true,
              }"
              :id="id"
              :slices="slices"
              kind="gears"
            ></map-best-accessory-roll>
          </b-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="slices"
            tab="gears"
          ></map-insights>

          <b-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </b-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </b-dashboard>
      </b-tabs>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from 'vue'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, BDashboardCell, BTabs, BScrollingList, BDashboard } from '@schneefux/klicker/components'
import { ObserveVisibility } from 'vue-observe-visibility'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'
import { useTrackScroll } from '~/composables/gtag'
import { winRateAdjMetric } from '~/lib/klicker.cubes'
import { useSyncSlicesAndRoute } from '~/composables/link'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BScrollingList,
    CDashboard,
    BDashboardCell,
    BTabs,
    BDashboard,
  },
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: String
    },
    gaCategory: {
      type: String
    },
  },
  setup(props) {
    const defaultQuery = computed<CubeQuery>(() => ({
      cubeId: 'battle',
      dimensionsIds: ['brawler'],
      metricsIds: ['picks', 'timestamp'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        mode: props.mode != undefined ? [props.mode] : [],
        map: props.map != undefined ? [props.map] : [],
        trophyRangeGte: [],
        powerplay: [],
      },
      sortId: 'brawler',
    }))

    const query = useSyncSlicesAndRoute(defaultQuery)
    const slices = computed(() => query.value.slices)

    const adjustedWinRate = winRateAdjMetric

    const { makeVisibilityCallback } = props.gaCategory != undefined ? useTrackScroll(props.gaCategory) : { makeVisibilityCallback: () => undefined }

    const { i18n } = useContext()
    const tabs = [{
      slot: 'brawlers',
      title: i18n.t('tab.brawlers'),
    }, {
      slot: 'starpowers',
      title: i18n.t('tab.starpowers'),
    }, {
      slot: 'gadgets',
      title: i18n.t('tab.gadgets'),
    }, {
      slot: 'gears',
      title: i18n.t('tab.gears'),
    }, {
      slot: 'leaderboard',
      title: i18n.t('tab.leaderboard'),
    }]

    return {
      tabs,
      query,
      adjustedWinRate,
      makeVisibilityCallback,
      slices,
    }
  },
})
</script>
