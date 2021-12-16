<template>
  <c-query :query="query">
    <template v-slot="data">
      <div>
        <v-line-plot
          :title="title"
          v-bind="data"
          class="h-72 flex-auto"
          full-height
        ></v-line-plot>
        <v-bar-plot
          :title="title"
          v-bind="data"
          class="h-72 flex-auto"
          full-height
        ></v-bar-plot>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VLinePlot, VBarPlot } from '~/klicker/components'
import { SliceValue, CubeQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    CQuery,
    VLinePlot,
    VBarPlot,
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
    const query = computed(() => (<CubeQuery>{
      cubeId: 'map',
      dimensionsIds: ['trophyRange'],
      measurementsIds: ['winRate'],
      slices: {
        ...props.slices,
        trophyRangeGte: [],
        trophyRangeLt: [],
      },
      sortId: 'trophyRange',
      confidenceInterval: true,
    }))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.balance-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
