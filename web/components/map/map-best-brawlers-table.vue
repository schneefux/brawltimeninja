<template>
  <c-query
    v-bind="$attrs"
    :state="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRateAdj', 'useRate'],
      slices: { mode: [mode], map: [map] },
      sortId: 'winRateAdj',
    }"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
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
import CQuery from '~/components/clicker/c-query'

export default Vue.extend({
  components: {
    VTable,
    DBrawler,
    CQuery,
    BrawlerLink,
  },
  inheritAttrs: false,
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: [Number, String]
    },
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return this.$i18n.t('best.brawlers.long') as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('best.brawlers.for.mode', {
          mode: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('best.brawlers.for.map', {
        mode: this.$i18n.t('mode.' + this.mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
  },
})
</script>
