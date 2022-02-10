<template>
  <c-query
    :query="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['winRateAdj'],
      sortId: 'winRateAdj',
      slices,
      limit,
    }"
  >
    <template v-slot="data">
      <v-roll
        v-bind="data"
        :card="card"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import DBrawler from '~/components/klicker/d-brawler.vue'
import { SliceValue } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
    DBrawler,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 3
    },
    card: {
      type: undefined,
      required: false
    },
  },
})
</script>
