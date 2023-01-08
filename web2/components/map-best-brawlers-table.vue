<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
        v-bind="data"
        :card="{ title }"
        link-path="/dashboard"
      ></v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VTable } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from 'vue'

export default defineComponent({
  components: {
    VTable,
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
    const { slices } = toRefs(props)
    const title = 'Best Brawlers'

    const query = computed<CubeQuery>(() => ({
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        metricsIds: ['winRateAdj', 'useRate'],
        slices: slices.value,
        sortId: 'winRateAdj',
      }
    ))

    return {
      query,
      title,
    }
  },
})
</script>
