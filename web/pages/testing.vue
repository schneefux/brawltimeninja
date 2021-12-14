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
      :query="{
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        slices: { mode: ['brawlBall'] },
        test: {
          measurementId: 'winRate',
          reference: {
            cubeId: 'map',
            dimensionsIds: ['brawler'],
            slices: {},
          },
        },
      }"
    >
      <template v-slot="data">
        <div class="w-full flex flex-wrap">
          <v-table v-bind="{ ...data, ...$attrs }">
            <template v-slot:dimensions="data">
              <d-brawler v-bind="data"></d-brawler>
            </template>
          </v-table>

          <v-test-info
            v-bind="{ ...data, ...$attrs }"
          ></v-test-info>
        </div>
      </template>
    </c-query>
  </client-only>
</template>

<script lang='ts'>
import { computed, defineComponent, ref } from "@nuxtjs/composition-api"
import { CQuery, VTable, VTestInfo } from '~/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VTable,
    VTestInfo,
  },
  setup() {
    return {
    }
  }
})
</script>
