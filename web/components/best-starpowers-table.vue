<template>
  <c-query
    :state="{
      cubeId: 'starpower',
      dimensionsIds: ['starpower'],
      measurementsIds: ['winRateAdj', 'picks'],
      slices: { starpowerIdNeq: ['0'] },
      sortId: 'winRateAdj',
    }"
  >
    <template v-slot="data">
      <v-table
        :title="$t('best.starpowers.long')"
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
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'

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
