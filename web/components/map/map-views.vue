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
        :items="totalsComponents"
        :cell-rows="1"
        :cell-columns="2"
        :render-at-least="3"
        key-id="id"
        render-placeholder
      >
        <template v-slot:item="component">
          <c-query :query="totalsQuery">
            <template v-slot="data">
              <component
                :is="component.component"
                :card="{}"
                v-bind="data"
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
        <template v-slot:brawlers>
          <b-dashboard
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
                :event-id="eventId"
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
                :event-id="eventId"
                :slices="slices"
              ></map-best-teams-table>
            </b-dashboard-cell>

            <ad kind="cell"></ad>

            <map-insights
              v-observe-visibility="{
                callback: makeVisibilityCallback('insights'),
                once: true,
              }"
              :event-id="eventId"
              :slices="slices"
              tab="brawlers"
            ></map-insights>

            <map-balance-chart
              :event-id="eventId"
              :slices="slices"
              v-observe-visibility="{
                callback: makeVisibilityCallback('charts'),
                once: true,
              }"
            ></map-balance-chart>

            <ad kind="cell"></ad>

            <b-dashboard-cell
              :columns="5"
              :rows="4"
              hide-empty
              lazy
            >
              <map-winrate-userate-chart
                :event-id="eventId"
                :slices="slices"
              ></map-winrate-userate-chart>
            </b-dashboard-cell>

            <b-dashboard-cell
              :columns="3"
              :rows="2"
            >
              <metric-info :metric="adjustedWinRate"></metric-info>
            </b-dashboard-cell>
          </b-dashboard>
        </template>

        <template v-slot:leaderboard>
          <b-dashboard responsive>
            <b-dashboard-cell
              :columns="4"
              :rows="5"
              hide-empty
              lazy
            >
              <map-best-players-table
                v-observe-visibility="{
                  callback: makeVisibilityCallback('leaderboard'),
                  once: true,
                }"
                :event-id="eventId"
                :slices="slices"
              ></map-best-players-table>
            </b-dashboard-cell>

            <ad kind="cell"></ad>
          </b-dashboard>
        </template>

        <template v-slot:starpowers>
          <b-dashboard responsive>
            <b-dashboard-cell
              :columns="4"
              :rows="5"
              hide-empty
              lazy
            >
              <map-best-accessory-table
                key="starpowers-table"
                v-observe-visibility="{
                  callback: makeVisibilityCallback('starpowers'),
                  once: true,
                }"
                :event-id="eventId"
                :slices="slices"
                kind="starpowers"
              ></map-best-accessory-table>
            </b-dashboard-cell>

            <map-insights
              v-observe-visibility="{
                callback: makeVisibilityCallback('insights'),
                once: true,
              }"
              :event-id="eventId"
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

            <ad kind="cell"></ad>
          </b-dashboard>
        </template>

        <template v-slot:gadgets>
          <b-dashboard responsive>
            <b-dashboard-cell
              :columns="4"
              :rows="5"
              hide-empty
              lazy
            >
              <map-best-accessory-table
                key="gadgets-table"
                v-observe-visibility="{
                  callback: makeVisibilityCallback('gadgets'),
                  once: true,
                }"
                :event-id="eventId"
                :slices="slices"
                kind="gadgets"
              ></map-best-accessory-table>
            </b-dashboard-cell>

            <map-insights
              v-observe-visibility="{
                callback: makeVisibilityCallback('insights'),
                once: true,
              }"
              :event-id="eventId"
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

            <ad kind="cell"></ad>
          </b-dashboard>
        </template>

        <template v-slot:gears>
          <b-dashboard responsive>
            <b-dashboard-cell
              :columns="4"
              :rows="5"
              hide-empty
              lazy
            >
              <map-best-accessory-table
                key="gears-table"
                v-observe-visibility="{
                  callback: makeVisibilityCallback('gears'),
                  once: true,
                }"
                :event-id="eventId"
                :slices="slices"
                kind="gears"
              ></map-best-accessory-table>
            </b-dashboard-cell>

            <map-insights
              v-observe-visibility="{
                callback: makeVisibilityCallback('insights'),
                once: true,
              }"
              :event-id="eventId"
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

            <ad kind="cell"></ad>
          </b-dashboard>
        </template>
      </b-tabs>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, BDashboardCell, BTabs, BScrollingList, BDashboard } from '@schneefux/klicker/components'
import { ObserveVisibility } from 'vue-observe-visibility'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'
import { useTrackScroll } from '~/composables/gtag'
import { winRateAdjMetric } from '~/lib/klicker.cubes'
import { useSyncSlicesAndRoute } from '~/composables/link'
import VLastUpdate from '~/components/klicker/v-last-update.vue'
import VSampleSize from '~/components/klicker/v-sample-size.vue'
import VMoe from '~/components/klicker/v-moe.vue'
import { useI18n } from 'vue-i18n'

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
    VLastUpdate,
    VSampleSize,
    VMoe,
  },
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    eventId: {
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

    const i18n = useI18n()
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

    const totalsComponents = [
      { id: 'sample-size', component: 'v-sample-size' },
      { id: 'last-update', component: 'v-last-update' },
      { id: 'moe', component: 'v-moe' },
    ]

    return {
      tabs,
      query,
      adjustedWinRate,
      makeVisibilityCallback,
      slices,
      totalsComponents,
    }
  },
})
</script>
