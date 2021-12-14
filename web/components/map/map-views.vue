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
      <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 justify-items-center">
        <b-card
          v-if="id != undefined"
          :title="$t('map.' + id)"
          md
        >
          <div
            slot="content"
            class="flex flex-wrap justify-center"
          >
            <media-img
              v-observe-visibility="{
                callback: (v, e) => trackScroll(v, e, 'image'),
                once: true,
              }"
              :path="id != 0 ? `/maps/${id}` : `/maps/competition-winners/${map.replace('Competition Winner ', '')}`"
              size="512"
              clazz="h-auto"
            ></media-img>
          </div>
        </b-card>

        <map-best-brawlers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'brawlers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          full-height
          md
        ></map-best-brawlers-table>

        <map-best-teams-table
          v-if="mode != 'soloShowdown'"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'teams'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          full-height
          md
        ></map-best-teams-table>

        <map-best-players-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'leaderboard'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          full-height
          md
        ></map-best-players-table>

        <map-best-starpowers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'starpowers'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="starpowers"
          full-height
          md
        ></map-best-starpowers-table>

        <map-best-starpowers-table
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'gadgets'),
            once: true,
          }"
          :id="id"
          :slices="query.slices"
          kind="gadgets"
          full-height
          md
        ></map-best-starpowers-table>

        <div
          class="lg:col-span-2 w-full flex flex-col"
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'charts'),
            once: true,
          }"
        >
          <map-balance-chart
            :id="id"
            :slices="query.slices"
            class="w-full"
          ></map-balance-chart>

          <map-winrate-userate-chart
            :id="id"
            :slices="query.slices"
            class="w-full"
          ></map-winrate-userate-chart>

          <div class="flex flex-wrap">
            <gadget-starpower-disclaimer full-height md></gadget-starpower-disclaimer>
            <metric-info full-height :measurement="adjustedWinRate" md></metric-info>
          </div>
        </div>
      </div>
    </template>
  </c-dashboard>
</template>

<script lang="ts">
import { computed, defineComponent, ref, useContext, watch, wrapProperty } from '@nuxtjs/composition-api'
import { CubeQuery } from '~/klicker'
import { CDashboard } from '~/klicker/components'
import { getSeasonEnd } from '~/lib/util'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    CDashboard,
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
    const { $klicker } = useContext()

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    const query = ref<CubeQuery>({
      cubeId: 'battle',
      dimensionsIds: ['brawler'],
      measurementsIds: [],
      slices: {
        season: [currentSeason.toISOString().slice(0, 10)],
        mode: [props.mode],
        map: [props.map],
        trophyRangeGte: ['0'],
        trophyRangeLt: ['10'],
        powerplay: [],
      },
      sortId: 'brawler',
    })

    watch(() => props.mode, () => query.value.slices.mode = [props.mode])
    watch(() => props.map, () => query.value.slices.map = [props.map])

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

    return {
      query,
      adjustedWinRate,
      trackScroll,
    }
  },
})
</script>
