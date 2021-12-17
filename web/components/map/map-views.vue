<template>
  <c-dashboard
    v-model="query"
    elevation="2"
    class="lg:justify-center"
  >
    <template v-slot:slices="data">
      <s-season v-bind="data"></s-season>
      <s-trophies v-bind="data"></s-trophies>
      <s-powerplay v-bind="data"></s-powerplay>
    </template>

    <template v-slot:totals="data">
      <div class="flex flex-wrap items-end">
        <v-sample-size full-heigth v-bind="data"></v-sample-size>
        <v-last-update full-heigth v-bind="data"></v-last-update>
      </div>
    </template>

    <template v-slot="query">
      <div class="w-full grid auto-rows-[minmax(14rem,auto)] md:auto-rows-[minmax(20rem,auto)] grid-cols-1 md:grid-cols-[repeat(auto-fill,28rem)] grid-flow-row-dense justify-center">
        <map-image
          v-if="id != undefined && map != 'Competition Entry'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'image'),
            once: true,
          }"
          :id="id"
          :map="map"
          class="row-span-2"
          full-height
        ></map-image>

        <map-best-brawlers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'brawlers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          full-height
        ></map-best-brawlers-table>

        <map-best-teams-table
          v-if="mode != 'soloShowdown'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'teams'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          full-height
        ></map-best-teams-table>

        <map-best-players-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'leaderboard'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          full-height
        ></map-best-players-table>

        <map-best-starpowers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          kind="starpowers"
          full-height
        ></map-best-starpowers-table>

        <map-best-starpowers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          kind="gadgets"
          full-height
        ></map-best-starpowers-table>

        <client-only>
          <adsense
            v-if="!isApp"
            data-ad-format="auto"
            data-ad-client="ca-pub-6856963757796636"
            data-ad-slot="4623162753"
            data-full-width-responsive="yes"
            class="row-span-2 self-center"
          />
        </client-only>

        <map-insights
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'insights'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          class="row-span-2"
          full-height
        ></map-insights>

        <map-balance-chart
          :id="id"
          :slices="query.slices"
          class="row-span-2 md:row-span-1 md:col-span-2"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'charts'),
            once: true,
          }"
        ></map-balance-chart>

        <map-winrate-userate-chart
          :id="id"
          :slices="query.slices"
          class="md:col-span-2"
        ></map-winrate-userate-chart>

        <map-trend-chart
          :id="id"
          :slices="query.slices"
          class="md:col-span-2"
        ></map-trend-chart>

        <div class="flex flex-wrap">
          <gadget-starpower-disclaimer full-height md></gadget-starpower-disclaimer>
          <metric-info full-height :measurement="adjustedWinRate" md></metric-info>
        </div>
      </div>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, useStore, watch, wrapProperty } from '@nuxtjs/composition-api'
import { CubeQuery } from '~/klicker'
import { CDashboard, VTestInfo } from '~/klicker/components'
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
    const { state } = useStore<any>()
    const { $klicker } = useContext()

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    function defaultQuery(): CubeQuery {
      return {
        cubeId: 'battle',
        dimensionsIds: ['brawler'],
        measurementsIds: [],
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

    const adjustedWinRate = computed(() => $klicker.config['battle'].measurements.find(m => m.id == 'winRateAdj')!)

    const gtag = useGtag()
    const trackScroll = (visible, element, section) => {
      if (props.gaCategory != undefined && visible) {
        gtag.event('scroll', {
          'event_category': props.gaCategory,
          'event_label': section,
        })
      }
    }

    const isApp = computed(() => state.isApp as boolean)

    return {
      isApp,
      query,
      adjustedWinRate,
      trackScroll,
    }
  },
})
</script>
