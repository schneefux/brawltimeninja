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
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
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
    limit: {
      type: Number,
      default: undefined
    },
  },
  setup(props) {
    const { eventId, slices, limit } = toRefs(props)
    const title = useTopNTitle('best.brawlers', slices, eventId)

    const query = computed<CubeQuery>(() => ({
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        metricsIds: ['winRateAdj', 'useRate'],
        slices: slices.value,
        sortId: 'winRateAdj',
        limit: limit.value,
      }
    ))

    return {
      query,
      title,
    }
  },
})
</script>
