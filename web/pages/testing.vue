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

    <div>
    <map-trend-chart class="h-80" :slices="{ mode: ['bounty'], map: ['Excel'] }"></map-trend-chart>
    <!--
    <c-query
      :query="{
        comparing: true,
        significant: true,
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRate'],
        slices: { mode: ['brawlBall'] },
        reference: {
          cubeId: 'map',
          dimensionsIds: ['brawler'],
          measurementsIds: ['winRate'],
          slices: {},
        },
        sortId: 'pvalue',
        limit: 5,
      }"
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
    -->
    </div>
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
    }
  }
})
</script>
