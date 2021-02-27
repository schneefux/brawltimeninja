<template>
  <c-query
    v-bind="$attrs"
    :config="config"
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
      >
        <template v-slot:dimensions="data">
          <d-player v-bind="data"></d-player>
          <d-brawler v-bind="data"></d-brawler>
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
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DPlayer,
    DBrawler,
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
      type: Number
    },
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return this.$i18n.t('leaderboard.thing.long', { thing: this.$i18n.tc('thing.player', 2) }) as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('leaderboard.thing.in.thing2', {
          thing: this.$i18n.tc('thing.player', 2),
          thing2: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('leaderboard.thing.in.thing2', {
        thing: this.$i18n.tc('thing.player', 2),
        thing2: `${this.$i18n.t('mode.' + this.mode) as string} - ${this.$i18n.t('map.' + this.id) as string}`,
      }) as string
    },
    isShowdown(): boolean {
      return this.mode != undefined && this.mode.toLowerCase().includes('showdown')
    },
    config() {
      return config
    },
  },
})
</script>
