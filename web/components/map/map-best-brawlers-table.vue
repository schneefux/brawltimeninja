<template>
  <c-query
    v-bind="$attrs"
    :state="state"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'

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
    // TODO remove usages of `mode` and `map`, replace by `slices`
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  computed: {
    state(): State {
      return {
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRateAdj', 'useRate'],
        slices: {
          mode: [this.mode],
          map: [this.map],
          ...this.slices,
        },
        sortId: 'winRateAdj',
      }
    },
    title(): string {
      const mode = this.slices.mode?.[0]
      const map = this.slices.map?.[0]

      if (mode == undefined) {
        return this.$i18n.t('best.brawlers.long') as string
      }
      if (map == undefined) {
        return this.$i18n.t('best.brawlers.for.mode', {
          mode: this.$i18n.t('mode.' + mode) as string,
        }) as string
      }
      return this.$i18n.t('best.brawlers.for.map', {
        mode: this.$i18n.t('mode.' + mode) as string,
        map: this.$i18n.t('map.' + this.id) as string,
      }) as string
    },
  },
})
</script>
