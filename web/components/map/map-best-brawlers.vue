<template>
  <c-query
    :query="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['winRateAdj'],
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
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import DBrawler from '~/components/klicker/d-brawler.vue'
import { SliceValue } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
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
