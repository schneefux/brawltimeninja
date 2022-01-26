<template>
  <page-dashboard title="Brawl Stars Meta Dashboard">
    <c-dashboard
      slot="dashboard"
      v-model="query"
      class="mt-2"
      configurator
      slicer
    >
      <template v-slot:totals="data">
        <div class="flex">
          <v-sample-size v-bind="data"></v-sample-size>
          <v-last-update v-bind="data"></v-last-update>
        </div>
      </template>

      <template v-slot:data="data">
        <v-dashboard v-bind="data">
          <template v-slot:dimensions="data">
            <d-brawler v-bind="data"></d-brawler>
            <d-team v-bind="data"></d-team>
            <d-mode v-bind="data"></d-mode>
            <d-map v-bind="data"></d-map>
            <d-season v-bind="data"></d-season>
            <d-player v-bind="data"></d-player>
          </template>

          <template v-slot:[`measurements.brawler`]="data">
            <m-brawler v-bind="data"></m-brawler>
          </template>
        </v-dashboard>
      </template>
    </c-dashboard>
  </page-dashboard>
</template>

<script lang="ts">
import { CubeQuery, CubeComparingQuery } from '@schneefux/klicker/types'
import { CDashboard } from '@schneefux/klicker/components'
import { useSyncQueryAndRoute } from '~/composables/link'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DMode from '@/components/klicker/d-mode.vue'
import DMap from '@/components/klicker/d-map.vue'
import DSeason from '@/components/klicker/d-season.vue'
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    CDashboard,
    DBrawler,
    BrawlerLink, // dependency of DBrawler
    DTeam,
    BrawlerTeam, // dependency of DTeam
    DMode,
    DMap,
    DSeason,
    DPlayer,
    MBrawler,
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
