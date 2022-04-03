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
      ></v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
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
