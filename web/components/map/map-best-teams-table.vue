<template>
  <c-query
    v-bind="$attrs"
    :config="config"
    :dimensions-ids="['team']"
    :measurements-ids="['wins']"
    :slices="{ mode: [mode], map: [map] }"
    sort-id="wins"
    cube-id="team"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        :link="dashboardLink"
        v-bind="data"
      >
        <template v-slot:[`dimensions.team`]="data">
          <d-team v-bind="data"></d-team>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { RawLocation } from 'vue-router'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DTeam from '@/components/clicker/renderers/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import CQuery from '@/components/clicker/c-query.vue'
import config from '@/lib/cube'

export default Vue.extend({
  components: {
    VTable,
    DTeam,
    BrawlerTeam, // dependency of DTeam
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
        return this.$i18n.t('leaderboard.thing.long', { thing: this.$i18n.tc('thing.team', 2) }) as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('leaderboard.thing.in.thing2', {
          thing: this.$i18n.tc('thing.team', 2),
          thing2: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('leaderboard.thing.in.thing2', {
        thing: this.$i18n.tc('thing.team', 2),
        thing2: `${this.$i18n.t('mode.' + this.mode) as string} - ${this.$i18n.t('map.' + this.id) as string}`,
      }) as string
    },
    dashboardLink(): RawLocation {
      return {
        path: '/dashboard',
        query: {
          cube: 'team',
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
