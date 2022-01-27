<template>
  <c-dashboard
    v-model="query"
    :elevation="2"
    :slicer-components="['s-season', 's-trophies', 's-powerplay']"
    class="lg:justify-center"
    slicer
  >
    <template v-slot:totals="data">
      <div class="w-full flex flex-wrap">
        <v-sample-size
          v-bind="data"
          :card="{ fullHeight: true }"
        ></v-sample-size>
        <v-last-update
          v-bind="data"
          :card="{ fullHeight: true }"
        ></v-last-update>
        <v-moe
          v-bind="data"
          :card="{ fullHeight: true }"
        ></v-moe>
      </div>
    </template>

    <template v-slot="query">
      <div class="w-full dashboard-grid">
        <map-image
          v-if="showImage"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'image'),
            once: true,
          }"
          :id="id"
          :map="map"
          class="dashboard-cell"
          style="--columns: 3; --rows: 4;"
        ></map-image>

        <map-best-brawlers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'brawlers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard-cell var--rows-3 md:var--rows-4"
          style="--columns: 3;"
        ></map-best-brawlers-table>

        <map-best-teams-table
          v-if="mode != 'soloShowdown'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'teams'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard-cell var--rows-3 md:var--rows-4"
          style="--columns: 3;"
        ></map-best-teams-table>

        <map-best-players-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'leaderboard'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard-cell"
          style="--columns: 3; --rows: 4;"
        ></map-best-players-table>

        <map-best-accessory-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="starpowers"
          class="dashboard-cell var--rows-3 md:var--rows-4"
          style="--columns: 3;"
        ></map-best-accessory-table>

        <map-best-accessory-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="gadgets"
          class="dashboard-cell var--rows-3 md:var--rows-4"
          style="--columns: 3;"
        ></map-best-accessory-table>

<!--
        <client-only>
          <adsense
            v-if="!isApp"
            data-ad-format="auto"
            data-ad-client="ca-pub-6856963757796636"
            data-ad-slot="4623162753"
            data-full-width-responsive="yes"
            class="self-center dashboard-cell"
            :style="{
              '--columns': showImage ? 1 : 2,
              '--rows': 4,
            }"
          />
        </client-only>
-->

        <map-insights
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'insights'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
        ></map-insights>

        <map-best-accessory-roll
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gears'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="gears"
          class="dashboard-cell"
          style="--columns: 4; --rows: 1;"
        ></map-best-accessory-roll>

          <map-balance-chart
            :id="id"
            :slices="query.slices"
            v-observe-visibility="{
              callback: (v, e) => trackScroll(v, e, 'charts'),
              once: true,
            }"
          ></map-balance-chart>

          <map-winrate-userate-chart
            :id="id"
            :slices="query.slices"
            class="dashboard-cell"
            style="--columns: 4; --rows: 3;"
          ></map-winrate-userate-chart>

          <map-trend-chart
            :id="id"
            :slices="query.slices"
            class="dashboard-cell"
            style="--columns: 4; --rows: 2;"
          ></map-trend-chart>

          <gadget-starpower-disclaimer
            class="dashboard-cell"
            style="--columns: 2; --rows: 1;"
            full-height
            dense
          ></gadget-starpower-disclaimer>
          <metric-info
            :metric="adjustedWinRate"
            class="dashboard-cell"
            style="--columns: 2; --rows: 1;"
            full-height
            dense
          ></metric-info>
      </div>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useStore, watch, wrapProperty } from '@nuxtjs/composition-api'
import { CubeQuery } from '@schneefux/klicker/types'
import { CDashboard, VTestInfo } from '@schneefux/klicker/components'
import { getSeasonEnd } from '~/lib/util'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    CDashboard,
    VTestInfo,
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

    const gtag = useGtag()
    const trackScroll = (visible, element, section) => {
      if (props.gaCategory != undefined && visible) {
        gtag.event('scroll', {
          'event_category': props.gaCategory,
          'event_label': section,
        })
      }
    }

    const isApp = computed(() => store.state.isApp as boolean)

    const showImage = computed(() => props.id != undefined && props.map != 'Competition Entry')

    return {
      isApp,
      query,
      showImage,
      adjustedWinRate,
      trackScroll,
    }
  },
})
</script>
