<template>
  <page title="Brawl Stars Meta Dashboard" no-container>
    <c-dashboard
      v-model="query"
      :configurator="{
        configureCube: true,
        configureMetrics: true,
        configureMultipleMetrics: true,
        configureDimensions: true,
        configureCompareMode: true,
      }"
      class="mt-2"
      slicer
    >
      <template v-slot:totals="data">
        <c-dashboard-cell :columns="2">
          <v-sample-size
            v-bind="data"
            :card="{ fullHeight: true }"
          ></v-sample-size>
        </c-dashboard-cell>
        <c-dashboard-cell :columns="2">
          <v-last-update
            v-bind="data"
            :card="{ fullHeight: true }"
          ></v-last-update>
        </c-dashboard-cell>
      </template>

      <template v-slot:data="data">
        <v-auto
          v-bind="data"
          :card="{ fullHeight: true }"
          for-grid
          all
        >
          <template v-slot:dimensions="data">
            <d-gear v-bind="data"></d-gear>
            <d-brawler v-bind="data"></d-brawler>
            <d-team v-bind="data"></d-team>
            <d-mode v-bind="data"></d-mode>
            <d-map v-bind="data"></d-map>
            <d-season v-bind="data"></d-season>
            <d-player v-bind="data"></d-player>
          </template>

          <template v-slot:[`metrics.brawler`]="data">
            <m-brawler v-bind="data"></m-brawler>
          </template>
        </v-auto>
      </template>
    </c-dashboard>

    <c-share class="mt-8"></c-share>
  </page>
</template>

<script lang="ts">
import { CubeQuery, CubeComparingQuery } from '@schneefux/klicker/types'
import { CDashboard, VAuto, CDashboardCell } from '@schneefux/klicker/components'
import { useSyncQueryAndRoute } from '~/composables/link'
import DBrawler from '@/components/klicker/d-brawler.vue'
import DTeam from '@/components/klicker/d-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import DGear from '@/components/klicker/d-gear.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    CDashboard,
    CDashboardCell,
    DBrawler,
    DGear,
    DTeam,
    DMode,
    DMap,
    DSeason,
    DPlayer,
    MBrawler,
    VAuto,
  },
  setup() {
    const { $klicker } = useContext()
    const urlQuery = useSyncQueryAndRoute($klicker.config, 'map')
    const query = computed<CubeQuery|CubeComparingQuery>({
      get() {
        return {
          ...urlQuery.value,
          confidenceInterval: true,
        }
      },
      set(value) {
        urlQuery.value = value
      },
    })

    return {
      query,
    }
  },
  meta: {
    title: 'Dashboard',
    screen: 'brawlers',
  },
  middleware: ['cached'],
})
</script>
