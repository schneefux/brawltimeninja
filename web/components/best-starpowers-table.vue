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
          <d-starpower v-bind="data"></d-starpower>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { RawLocation } from 'vue-router'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DStarpower from '@/components/clicker/renderers/d-starpower.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DStarpower,
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
