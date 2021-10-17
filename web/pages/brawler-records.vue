<template>
  <page
    :title="$t('brawler-records.title')"
    class="max-w-2xl mx-auto"
  >
    <b-card class="mt-3">
      <p slot="content" class="my-2 prose text-gray-200">
        {{ $t('brawler-records.info') }}
      </p>
    </b-card>

    <b-card :title="$t('brawler-records.players')">
      <div slot="content">
        <c-dashboard
          v-model="state"
          elevation="2"
        >
          <template v-slot:slices="data">
            <s-season
              v-bind="data"
              :limit="52"
              exact
            ></s-season>
            <s-brawler v-bind="data"></s-brawler>
            <s-power v-bind="data"></s-power>
          </template>

          <template v-slot:totals="data">
            <div class="w-full flex flex-wrap">
              <v-last-update v-bind="data"></v-last-update>
            </div>
          </template>

          <template v-slot:data="data">
            <div class="contents">
              <v-table class="w-full" v-bind="data">
                <template v-slot:dimensions="data">
                  <div class="flex flex-wrap items-center">
                    <d-player class="w-full md:w-auto md:flex-1 !justify-start" v-bind="data"></d-player>
                    <d-brawler class="w-full md:w-auto md:flex-1 !justify-start" v-bind="data"></d-brawler>
                  </div>
                </template>

                <template v-slot:[`measurements.highestTrophies`]="data">
                  {{ data.row.measurementsRaw.highestTrophies }}
                </template>
              </v-table>
              <div class="p-1">
                <v-csv v-bind="data"></v-csv>
              </div>
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
import { CDashboard, BCard, CMetric, VTable, VCsv } from '~/klicker/components'
import { getSeasonEnd } from '~/lib/util'

export default Vue.extend({
  components: {
    CDashboard,
    BCard,
    CMetric,
    VTable,
    VCsv,
  },
  head() {
    const description = this.$t('brawler-records.meta.description') as string
    return {
      title: this.$t('brawler-records.meta.title') as string,
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
    const currentSeason = getSeasonEnd(new Date())

    return {
      state: <State>{
        cubeId: 'brawler',
        dimensionsIds: ['player', 'brawler'],
        measurementsIds: ['highestTrophies'],
        slices: {
          season: [],
          seasonExact: [currentSeason.toISOString().slice(0, 10)],
          brawler: [],
          powerGte: ['1'],
          powerLte: ['10'],
        },
        sortId: 'highestTrophies',
        comparing: false,
        limit: 100,
      },
    }
  },
})
</script>
