<template>
  <c-query
    v-bind="$attrs"
    :config="config"
    :dimensions-ids="['brawler']"
    :measurements-ids="['winRateAdj', 'useRate']"
    :slices="{ mode: [mode], map: [map] }"
    sort-id="winRateAdj"
    cube-id="map"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        :link="dashboardLink"
        v-bind="data"
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
  props: {
    mode: {
      type: String
    },
    map: {
      type: String
    },
    id: {
      type: Number
    },
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return this.$i18n.t('leaderboard.thing.long', { thing: this.$i18n.tc('thing.brawler', 2) }) as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('leaderboard.thing.for.thing2', {
          thing: this.$i18n.tc('thing.brawler', 2),
          thing2: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('leaderboard.thing.for.thing2', {
        thing: this.$i18n.tc('thing.brawler', 2),
        thing2: `${this.$i18n.t('mode.' + this.mode) as string} - ${this.$i18n.t('map.' + this.id) as string}`,
      }) as string
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'map',
          ...(this.mode != undefined ? {
            mode: this.mode,
          } : {}),
          ...(this.map != undefined ? {
            map: this.map,
          } : {}),
        },
      }
    },
    config() {
      return config
    },
  },
})
</script>
