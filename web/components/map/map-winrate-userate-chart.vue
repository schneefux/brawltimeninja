<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-scatterplot
        v-bind="data"
        :card="{ title }"
      ></v-scatterplot>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VScatterplot } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from 'vue'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VScatterplot,
    CQuery,
  },
  props: {
    eventId: {
      type: [Number, String],
      default: () => undefined
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const query = computed<CubeQuery>(() => ({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['useRate', 'winRate'],
      slices: props.slices,
      sortId: 'useRate',
    }))

    const { eventId, slices } = toRefs(props)
    const title = useTopNTitle('brawler.winrate-userate-chart', slices, eventId)

    return {
      title,
      query,
    }
  },
})
</script>
