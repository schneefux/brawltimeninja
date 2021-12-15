<template>
  <client-only>
    <!--

      TODO: Implement compare-to-total-picks-by-day component
        * Input: dimensions=day, measurements=picks, data=…, slices={ brawler: b, … }
        * Fetch totals: Construct same query but exclude brawler from slices
        * Calculate use rate / 1d
        * Calculate use rate / 7d
        * Pass both traces to b-vega or v-lineplot (?)

    -->

    <!--
      TODO support overlapping charts
      TODO implement a v-roll that shows the highest p values
    -->
    <c-query
      :query="/*{
        comparing: true,
        cubeId: 'map',
        dimensionsIds: ['season'],
        measurementsIds: ['winRate'],
        slices: { mode: ['brawlBall'] },
        reference: {
          cubeId: 'map',
          dimensionsIds: ['season'],
          measurementsIds: ['winRate'],
          slices: {},
        },
      }*/
      query "
    >
      <template v-slot="data">
        <div class="w-full flex flex-wrap">
          <v-roll v-bind="{ ...data, ...$attrs }">
            <template v-slot:dimensions="data">
              <d-brawler v-bind="data"></d-brawler>
            </template>
          </v-roll>

          <v-bar-plot class="h-80" v-bind="{ ...data, ...$attrs }" md full-height></v-bar-plot>
          <v-line-plot class="h-80" v-bind="{ ...data, ...$attrs }" md full-height></v-line-plot>

          <v-test-info
            v-bind="{ ...data, ...$attrs }"
          ></v-test-info>
        </div>
      </template>
    </c-query>
  </client-only>
</template>

<script lang='ts'>
import { defineComponent } from "@nuxtjs/composition-api"
import { CQuery, VTable, VTestInfo, VBarPlot, VLinePlot, VRoll } from '~/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VTable,
    VTestInfo,
    VBarPlot,
    VLinePlot,
    VRoll,
  },
  setup() {
    return {
      query: { comparing: true, cubeId: 'map', slices: { season: [ '2021-11-15' ], trophyRangeGte: [ '0' ], 'trophyRangeLt': [ '10' ], "brawler": [], "mode": [ "heist" ], "map": [], "mapLike": [], "mapNotLike": [], "powerplay": [ "false" ] }, "dimensionsIds": [ "brawler" ], "measurementsIds": [ "winRateAdj" ], "reference": { "cubeId": "map", "dimensionsIds": [ "brawler" ], "slices": { "season": [ "2021-11-15" ], "trophyRangeGte": [ "0" ], "trophyRangeLt": [ "10" ], "brawler": [], "mode": [ "heist" ], "map": [], "mapLike": [], "mapNotLike": [], "powerplay": [ "false" ] }, "measurementsIds": [ "winRateAdj" ] } }
    }
  }
})
</script>
