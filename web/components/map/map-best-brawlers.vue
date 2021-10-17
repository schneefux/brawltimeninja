<template>
  <c-query
    :state="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRateAdj'],
      slices,
      sortId: 'winRateAdj',
      limit,
    }"
  >
    <b-shimmer
      slot="placeholder"
      width-px="265"
      height-px="72"
      loading
    ></b-shimmer>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$attrs }">
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import DBrawler from '~/components/klicker/d-brawler.vue'
import { SliceValue } from '~/klicker'
import { VRoll, BShimmer, CQuery } from '~/klicker/components'

export default Vue.extend({
  inheritAttrs: false,
  components: {
    VRoll,
    BShimmer,
    CQuery,
    DBrawler,
    BrawlerLink,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 5
    },
  },
})
</script>
