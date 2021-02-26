<template>
  <c-query
    :config="config"
    :state="{
      cubeId: 'gadget',
      dimensionsIds: ['gadget'],
      measurementsIds: ['winRateAdj', 'picks'],
      slices: { withGadget: [true] },
      sortId: 'winRateAdj',
    }"
  >
    <template v-slot="data">
      <v-table
        :title="$t('leaderboard.thing.long', { thing: $tc('thing.gadget', 2) })"
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
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
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
