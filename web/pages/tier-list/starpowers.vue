<template>
  <page
    :title="$t('tier-list.starpower.title')"
    class="max-w-2xl mx-auto"
  >
    <breadcrumbs
      :links="[{
        path: '/tier-list/brawler',
        name: $tc('brawler', 2),
      }, {
        path: '/tier-list/starpowers',
        name: $tc('starpower', 2),
      }]"
      class="mt-2"
    ></breadcrumbs>

    <b-card class="mt-3">
      <p slot="content" class="prose text-gray-200">
        {{ $t('tier-list.starpower.description') }}
      </p>
    </b-card>

    <gadget-starpower-disclaimer></gadget-starpower-disclaimer>

    <b-card :title="$t('tier-list.starpower.starpowers')">
      <div slot="content">
        <b-card elevation="2">
          <div slot="content">
            <c-metric
              v-model="query"
              :options="['picks', 'wins', 'winRate', 'winRateAdj', 'starRate', 'rank']"
            ></c-metric>
          </div>
        </b-card>

        <c-dashboard
          v-model="query"
          elevation="2"
          class="mt-2"
        >
          <template v-slot:slices="data">
            <s-season v-bind="data"></s-season>
            <s-trophies v-bind="data"></s-trophies>
            <s-powerplay v-bind="data"></s-powerplay>
            <s-competition-maps v-bind="data"></s-competition-maps>
            <s-mode-map v-bind="data"></s-mode-map>
          </template>

          <template v-slot:totals="data">
            <div class="w-full flex flex-wrap">
              <v-sample-size v-bind="data"></v-sample-size>
              <v-last-update v-bind="data"></v-last-update>
            </div>
          </template>

          <template v-slot:data="data">
            <!-- add wrapper div to work around SSR error -->
            <div class="contents">
              <v-table class="w-full" v-bind="data">
                <template v-slot:dimensions="data">
                  <d-brawler v-bind="data"></d-brawler>
                </template>
              </v-table>
              <v-test-info v-bind="data"></v-test-info>
            </div>
          </template>
        </c-dashboard>
      </div>
    </b-card>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { CubeComparingQuery } from '~/klicker'
import { CDashboard, CMetric, VTable, BCard, VTestInfo } from '~/klicker/components'
import { getSeasonEnd } from '~/lib/util'
import VSampleSize from '~/components/klicker/v-sample-size.vue'
import VLastUpdate from '~/components/klicker/v-last-update.vue'
import DBrawler from '~/components/klicker/d-brawler.vue'
import SSeason from '~/components/klicker/s-season.vue'
import STrophies from '~/components/klicker/s-trophies.vue'
import SPowerplay from '~/components/klicker/s-powerplay.vue'
import SCompetitionMaps from '~/components/klicker/s-competition-maps.vue'
import SModeMap from '~/components/klicker/s-mode-map.vue'

export default Vue.extend({
  components: {
    BCard,
    CDashboard,
    CMetric,
    VTable,
    VSampleSize,
    VLastUpdate,
    DBrawler,
    SSeason,
    STrophies,
    SPowerplay,
    SCompetitionMaps,
    SModeMap,
    VTestInfo,
  },
  middleware: ['cached'],
  head() {
    const description = this.$t('tier-list.starpower.meta.description') as string
    return {
      title: this.$t('tier-list.starpower.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Star Powers',
    screen: 'brawlers',
  },
  data() {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    return {
      query: <CubeComparingQuery>{
        cubeId: 'battle',
        dimensionsIds: ['brawler', 'starpowers'],
        measurementsIds: ['winRate'],
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          trophyRangeGte: ['0'],
          powerplay: [],
          mode: [],
          map: [],
          mapLike: [],
          mapNotLike: [],
          starpowerIdNeq: ['0'],
        },
        sortId: 'winRate',
        comparing: true,
        reference: {
          cubeId: 'battle',
          dimensionsIds: ['brawler'],
          measurementsIds: ['winRate'],
          slices: {
            season: [currentSeason.toISOString().slice(0, 10)],
            trophyRangeGte: ['0'],
            powerplay: [],
            mode: [],
            map: [],
            mapLike: [],
            mapNotLike: [],
            starpowerIdEq: ['0'],
          },
          sortId: 'winRate',
        },
      },
    }
  },
})
</script>
