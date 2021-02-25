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
        v-bind="data"
        class="mt-4"
        show-link
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
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DBrawler,
    CQuery,
    BrawlerLink,
  },
  inheritAttrs: false,
  computed: {
    config() {
      return config
    },
  },
})
</script>
