<template>
  <page
    :title="$t('bar-chart-race.title')"
    class="max-w-2xl mx-auto"
  >
    <b-card
      :title="$t('bar-chart-race.howto.title')"
      class="mt-3"
    >
      <p slot="content" class="mb-2 prose text-gray-200">
        {{ $t('bar-chart-race.howto.description') }}
      </p>
    </b-card>

    <b-card :title="$t('bar-chart-race.note.title')">
      <div slot="content" class="mb-2">
        <p class="prose text-gray-200">
          {{ $t('bar-chart-race.note.description') }}
        </p>
        <q slot="content" class="prose text-gray-200 italic">{{ $t('attribution-example', { date: new Date().toDateString() }) }}</q>
      </div>
    </b-card>

    <b-card :title="$t('bar-chart-race.brawler')">
      <div slot="content">
        <b-card elevation="2">
          <div slot="content">
            <c-metric
              v-model="state"
              :options="['pickRate', 'useRate', 'winRate', 'winRateAdj', 'starRate']"
            ></c-metric>
          </div>
        </b-card>

        <c-dashboard
          v-model="state"
          elevation="2"
        >
          <template v-slot:slices="data">
            <s-season v-bind="data"></s-season>
            <s-mode-map v-bind="data"></s-mode-map>
            <s-trophies v-bind="data"></s-trophies>
            <s-powerplay v-bind="data"></s-powerplay>
            <s-competition-maps v-bind="data"></s-competition-maps>
          </template>

          <template v-slot:totals="data">
            <div class="w-full flex flex-wrap">
              <v-sample-size v-bind="data"></v-sample-size>
              <v-last-update v-bind="data"></v-last-update>
            </div>
          </template>

          <template v-slot:data="data">
            <div class="contents">
              <div class="w-full flex flex-wrap justify-center gap-2 m-2">
                <v-csv class="flex-1" v-bind="data"></v-csv>
                <v-pivot-csv class="flex-1" v-bind="data"></v-pivot-csv>
              </div>
              <v-table class="w-full" v-bind="data">
                <template v-slot:dimensions="data">
                  <div class="flex flex-wrap items-center">
                    <d-brawler v-bind="data"></d-brawler>
                    <span class="mr-2">{{ data.row.dimensions.day }}</span>
                  </div>
                </template>
              </v-table>
            </div>
          </template>
        </c-dashboard>
      </div>
    </b-card>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from '~/klicker'
import { CDashboard, BCard, CMetric, VTable, VCsv, VPivotCsv } from '~/klicker/components'
import { getSeasonEnd } from '~/lib/util'

export default Vue.extend({
  components: {
    CDashboard,
    BCard,
    CMetric,
    VTable,
    VCsv,
    VPivotCsv,
  },
  head() {
    const description = this.$t('bar-chart-race.meta.description') as string
    return {
      title: this.$t('bar-chart-race.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Bar Chart Race',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  data() {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    return {
      state: <State>{
        cubeId: 'battle',
        dimensionsIds: ['brawler', 'day'],
        measurementsIds: ['useRate'],
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          mode: [],
          trophyRangeGte: ['0'],
          trophyRangeLt: ['10'],
          powerplay: [],
          mapLike: [],
          mapNotLike: [],
        },
        sortId: 'day',
        comparing: false,
      },
    }
  },
})
</script>
