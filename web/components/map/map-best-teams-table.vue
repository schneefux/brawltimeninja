<template>
  <c-query
    v-bind="$attrs"
    :state="state"
    :limit="limit"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
      >
        <template v-slot:dimensions="data">
          <d-team v-bind="data"></d-team>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'

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
    },
    // TODO remove usages of `mode` and `map`, replace by `slices`
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  computed: {
    state(): State {
      return {
        cubeId: 'battle',
        dimensionsIds: ['team'],
        measurementsIds: ['wins'],
        slices: {
          mode: [this.mode],
          map: [this.map],
          ...this.slices,
        },
        sortId: 'wins',
      }
    },
    title(): string {
      const mode = this.slices.mode?.[0]
      const map = this.slices.map?.[0]

      if (mode == undefined) {
        return this.$i18n.t('best.teams.long') as string
      }
      if (map == undefined) {
        return this.$i18n.t('best.teams.for.mode', {
          mode: this.$i18n.t('mode.' + mode) as string,
        }) as string
      }
      return this.$i18n.t('best.teams.for.map', {
        mode: this.$i18n.t('mode.' + mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
  },
})
</script>
