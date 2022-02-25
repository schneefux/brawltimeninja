<template>
  <c-dashboard
    v-model="query"
    :elevation="1"
    :slicer-components="['s-season', 's-trophies', 's-powerplay']"
    class="lg:justify-center"
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
      <c-dashboard-cell :columns="2">
        <v-moe
          v-bind="data"
          :card="{ fullHeight: true }"
        ></v-moe>
      </c-dashboard-cell>
    </template>

    <template v-slot="query">
      <b-tabs
        :tabs="tabs"
        class="!mt-12 -mx-4 md:mx-0 px-4 md:px-0"
        nav-class="top-14 md:top-0 z-20"
      >
        <div
          slot="brawlers"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
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
              :slices="query.slices"
            ></map-best-brawlers-table>
          </c-dashboard-cell>

          <c-dashboard-cell
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
              :slices="query.slices"
            ></map-best-teams-table>
          </c-dashboard-cell>

          <ad-cell
            :columns="3"
            :rows="2"
            ad-slot="4623162753"
          ></ad-cell>

          <map-balance-chart
            :id="id"
            :slices="query.slices"
            v-observe-visibility="{
              callback: makeVisibilityCallback('charts'),
              once: true,
            }"
          ></map-balance-chart>

          <c-dashboard-cell
            :columns="5"
            :rows="4"
            ssr-key="map-winrate-userate-chart"
            hide-empty
            lazy
          >
            <map-winrate-userate-chart
              :id="id"
              :slices="query.slices"
            ></map-winrate-userate-chart>
          </c-dashboard-cell>

          <c-dashboard-cell
            :columns="6"
            :rows="4"
            ssr-key="map-trend-chart"
            hide-empty
            lazy
          >
            <map-trend-chart
              :id="id"
              :slices="query.slices"
            ></map-trend-chart>
          </c-dashboard-cell>

          <c-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <metric-info
              :metric="adjustedWinRate"
              full-height
            ></metric-info>
          </c-dashboard-cell>
        </div>

        <div
          slot="leaderboard"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
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
              :slices="query.slices"
            ></map-best-players-table>
          </c-dashboard-cell>

          <ad-cell
            :columns="8"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </div>

        <div
          slot="starpowers"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
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
              :slices="query.slices"
              kind="starpowers"
            ></map-best-accessory-table>
          </c-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="query.slices"
            tab="starpowers"
          ></map-insights>

          <c-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </c-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </div>

        <div
          slot="gadgets"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
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
              :slices="query.slices"
              kind="gadgets"
            ></map-best-accessory-table>
          </c-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="query.slices"
            tab="gadgets"
          ></map-insights>

          <c-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </c-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </div>

        <div
          slot="gears"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
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
              :slices="query.slices"
              kind="gears"
            ></map-best-accessory-roll>
          </c-dashboard-cell>

          <map-insights
            v-observe-visibility="{
              callback: makeVisibilityCallback('insights'),
              once: true,
            }"
            :id="id"
            :slices="query.slices"
            tab="gears"
          ></map-insights>

          <c-dashboard-cell
            :columns="3"
            :rows="2"
          >
            <gadget-starpower-disclaimer
              card
            ></gadget-starpower-disclaimer>
          </c-dashboard-cell>

          <ad-cell
            :columns="5"
            :rows="3"
            ad-slot="4623162753"
          ></ad-cell>
        </div>
      </b-tabs>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useStore, watch } from '@nuxtjs/composition-api'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, CDashboardCell, VTestInfo, BTabs } from '@schneefux/klicker/components'
import { getSeasonEnd } from '~/lib/util'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  components: {
    CDashboard,
    CDashboardCell,
    VTestInfo,
    BTabs,
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
    timestamp: {
      type: String
    },
    gaCategory: {
      type: String
    },
  },
  setup(props) {
    const store = useStore<any>()
    const { $klicker } = useContext()

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    function defaultQuery(): CubeQuery {
      return {
        cubeId: 'battle',
        dimensionsIds: ['brawler'],
        metricsIds: [],
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          mode: props.mode != undefined ? [props.mode] : [],
          map: props.map != undefined ? [props.map] : [],
          trophyRangeGte: ['0'],
          powerplay: [],
        },
        sortId: 'brawler',
      }
    }
    const query = ref<CubeQuery>(defaultQuery())

    watch(() => [props.mode, props.map], () => query.value = defaultQuery())

    const adjustedWinRate = computed(() => $klicker.config['battle'].metrics.find(m => m.id == 'winRateAdj')!)

    const { makeVisibilityCallback } = props.gaCategory != undefined ? useTrackScroll(props.gaCategory) : { makeVisibilityCallback: () => undefined }

    const isApp = computed(() => store.state.isApp as boolean)

    const tabs = [{ id: 'brawlers', title: 'Brawlers' }, { id: 'starpowers', title: 'Star Powers' }, { id: 'gadgets', title: 'Gadgets' }, { id: 'gears', title: 'Gears' }, { id: 'leaderboard', title: 'Leaderboard' }]

    return {
      tabs,
      isApp,
      query,
      adjustedWinRate,
      makeVisibilityCallback,
    }
  },
})
</script>
