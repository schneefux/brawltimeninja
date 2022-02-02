<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-scatterplot
        v-bind="data"
        :card="{ title, fullHeight: true }"
      ></v-scatterplot>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VScatterplot } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VScatterplot,
    CQuery,
  },
  props: {
    id: {
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

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.winrate-userate-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
