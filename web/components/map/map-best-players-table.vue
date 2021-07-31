<template>
  <c-query
    v-bind="$attrs"
    :state="{
      cubeId: 'battle',
      dimensionsIds: ['player'],
      measurementsIds: isShowdown ? ['picks', 'rank', 'brawler'] : ['wins', 'winRate', 'brawler'],
      slices: { mode: [mode], map: [map] },
      sortId: isShowdown ? 'picks' : 'wins',
    }"
    :limit="50"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
        show-link
      >
        <template v-slot:dimensions="data">
          <d-player v-bind="data"></d-player>
          <d-brawler v-bind="data"></d-brawler>
        </template>
        <template v-slot:[`measurements.brawler`]="data">
          <m-brawler v-bind="data"></m-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DPlayer from '@/components/clicker/renderers/d-player.vue'
import DBrawler from '@/components/clicker/renderers/d-brawler.vue'
import MBrawler from '@/components/clicker/renderers/m-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import CQuery from '~/components/clicker/c-query'

export default Vue.extend({
  components: {
    VTable,
    DPlayer,
    DBrawler,
    MBrawler,
    CQuery,
    BrawlerLink,
  },
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
    },
    map: {
      type: String,
    },
    id: {
      type: [Number, String]
    },
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return this.$i18n.t('best.players.long') as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('best.players.for.mode', {
          mode: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('best.players.for.map', {
        mode: this.$i18n.t('mode.' + this.mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
    isShowdown(): boolean {
      return this.mode != undefined && this.mode.toLowerCase().includes('showdown')
    },
  },
})
</script>
