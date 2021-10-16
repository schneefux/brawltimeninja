<template>
  <c-query
    v-bind="$attrs"
    :state="state"
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
        <template v-slot:[`measurements.brawler`]="data">
          <m-brawler v-bind="data"></m-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import DPlayer from '@/components/klicker/d-player.vue'
import DBrawler from '@/components/klicker/d-brawler.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'

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
    id: {
      type: [Number, String]
    },
    slices: {
      type: Object as PropType<SliceValue>
    },
  },
  computed: {
    state(): State {
      return {
        cubeId: 'battle',
        dimensionsIds: ['player'],
        measurementsIds: this.isShowdown ? ['picks', 'rank', 'brawler'] : ['wins', 'winRate', 'brawler'],
        slices: this.slices,
        sortId: this.isShowdown ? 'picks' : 'wins',
      }
    },
    title(): string {
      const mode = this.slices.mode?.[0]
      const map = this.slices.map?.[0]

      if (mode == undefined) {
        return this.$i18n.t('best.players.long') as string
      }
      if (map == undefined) {
        return this.$i18n.t('best.players.for.mode', {
          mode: this.$i18n.t('mode.' + mode) as string,
        }) as string
      }
      return this.$i18n.t('best.players.for.map', {
        mode: this.$i18n.t('mode.' + mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
    isShowdown(): boolean {
      return this.slices.mode?.[0]?.toLowerCase().includes('showdown')
    },
  },
})
</script>
