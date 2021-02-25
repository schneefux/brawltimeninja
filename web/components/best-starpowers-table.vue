<template>
  <c-query
    :config="config"
    :dimensions-ids="['starpower']"
    :measurements-ids="['winRateAdj', 'picks']"
    :slices-values="{ withStarpower: [true] }"
    sort-id="winRateAdj"
    cube-id="starpower"
  >
    <template v-slot="data">
      <v-table
        :title="$t('leaderboard.thing.long', { thing: $tc('thing.starpower', 2) })"
        :link="dashboardLink"
        v-bind="data"
        class="mt-4"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { RawLocation } from 'vue-router'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DBrawler,
    CQuery,
  },
  inheritAttrs: false,
  computed: {
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'starpower',
        },
      }
    },
    config() {
      return config
    },
  },
})
</script>
