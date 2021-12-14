<template>
  <c-query :query="query">
    <template v-slot="data">
      <div>
        <v-scatter-plot
          :title="title"
          v-bind="data"
          class="h-72 flex-auto"
          full-height
        ></v-scatter-plot>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VScatterPlot } from '~/klicker/components'
import { SliceValue, CubeQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VScatterPlot,
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
        measurementsIds: ['useRate', 'winRate'],
        slices: props.slices,
        sortId: 'useRate',
      }
    ))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.winrate-userate-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
