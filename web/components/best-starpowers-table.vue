<template>
  <c-query
    :state="{
      cubeId: 'starpower',
      dimensionsIds: ['starpower'],
      measurementsIds: ['winRateAdj', 'picks'],
      slices: { withStarpower: [true] },
      sortId: 'winRateAdj',
    }"
  >
    <template v-slot="data">
      <v-table
        :title="$t('leaderboard.thing.long', { thing: $tc('thing.starpower', 2) })"
        v-bind="{ ...$attrs, ...data }"
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

export default Vue.extend({
  inheritAttrs: false,
  components: {
    VTable,
    DBrawler,
    CQuery,
    BrawlerLink,
  },
})
</script>
