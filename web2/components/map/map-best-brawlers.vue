<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-roll
        v-bind="data"
        :card="card"
      ></v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watch } from 'vue'
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
  setup(props) {
    watch(() => props.slices, () => console.log('slice change'))
    watch(() => props.limit, () => console.log('limit change'))
    const query = computed(() => ({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['winRateAdj'],
      sortId: 'winRateAdj',
      slices: props.slices,
      limit: props.limit,
    }))
    watch(query, () => console.log('query change'))

    return {
      query,
    }
  }
})
</script>
