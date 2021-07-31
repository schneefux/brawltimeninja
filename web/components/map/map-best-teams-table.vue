<template>
  <c-query
    v-bind="$attrs"
    :state="{
      cubeId: 'battle',
      dimensionsIds: ['team'],
      measurementsIds: ['wins'],
      slices: { mode: [mode], map: [map] },
      sortId: 'wins',
    }"
    :limit="limit"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
        show-link
      >
        <template v-slot:dimensions="data">
          <d-team v-bind="data"></d-team>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import VTable from '@/components/clicker/visualisations/v-table.vue'
import DTeam from '@/components/clicker/renderers/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import CQuery from '~/components/clicker/c-query'

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
      type: [Number, String]
    },
    limit: {
      type: Number,
      default: 50
    }
  },
  computed: {
    title(): string {
      if (this.mode == undefined) {
        return this.$i18n.t('best.teams.long') as string
      }
      if (this.map == undefined) {
        return this.$i18n.t('best.teams.for.mode', {
          mode: this.$i18n.t('mode.' + this.mode) as string,
        }) as string
      }
      return this.$i18n.t('best.teams.for.map', {
        mode: this.$i18n.t('mode.' + this.mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
  },
})
</script>
