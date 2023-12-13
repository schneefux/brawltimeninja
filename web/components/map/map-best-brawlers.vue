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
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue } from '@schneefux/klicker/types'
import { VRoll, CQuery } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    VRoll,
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
    const query = computed(() => ({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['winRateAdj'],
      sortId: 'winRateAdj',
      slices: props.slices,
      limit: props.limit,
    }))

    return {
      query,
    }
  }
})
</script>
