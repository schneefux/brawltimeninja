<template>
  <c-dashboard
    v-model="query"
    :elevation="1"
    :slicer-components="['s-season', 's-trophies', 's-powerplay']"
    class="lg:justify-center"
    slicer
  >
    <template v-slot:totals="data">
      <div class="dashboard dashboard--responsive">
        <v-sample-size
          v-bind="data"
          :card="{ fullHeight: true }"
          class="dashboard__cell"
          style="--columns: 2;"
        ></v-sample-size>
        <v-last-update
          v-bind="data"
          :card="{ fullHeight: true }"
          class="dashboard__cell"
          style="--columns: 2;"
        ></v-last-update>
        <v-moe
          v-bind="data"
          :card="{ fullHeight: true }"
          class="dashboard__cell"
          style="--columns: 2;"
        ></v-moe>
      </div>
    </template>

    <template v-slot="query">
      <div class="dashboard dashboard--responsive">
        <map-best-brawlers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'brawlers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 4; --rows: 5;"
        ></map-best-brawlers-table>

        <map-best-teams-table
          v-if="mode != 'soloShowdown' && mode != 'duels'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'teams'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 4; --rows: 5;"
        ></map-best-teams-table>

        <map-best-players-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'leaderboard'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 4; --rows: 5;"
        ></map-best-players-table>

        <map-best-accessory-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="starpowers"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 4; --rows: 5;"
        ></map-best-accessory-table>

        <map-best-accessory-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="gadgets"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 4; --rows: 5;"
        ></map-best-accessory-table>

<!--
        <client-only>
          <adsense
            v-if="!isApp"
            data-ad-format="auto"
            data-ad-client="ca-pub-6856963757796636"
            data-ad-slot="4623162753"
            data-full-width-responsive="yes"
            class="self-center dashboard__cell"
            :style="{
              '--columns': 2,
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
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 5; --rows: 2;"
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
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 5; --rows: 4;"
        ></map-winrate-userate-chart>

        <map-trend-chart
          :id="id"
          :slices="query.slices"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 5; --rows: 3;"
        ></map-trend-chart>

        <gadget-starpower-disclaimer
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 3; --rows: 2;"
          card
        ></gadget-starpower-disclaimer>
        <metric-info
          :metric="adjustedWinRate"
          class="dashboard__cell dashboard__cell--hide-empty"
          style="--columns: 3; --rows: 1;"
          full-height
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

    return {
      isApp,
      query,
      adjustedWinRate,
      trackScroll,
    }
  },
})
</script>
