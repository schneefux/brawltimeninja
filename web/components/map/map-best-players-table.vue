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
import { defineComponent, PropType, computed, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

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
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const { id, slices } = toRefs(props)
    const title = useTopNTitle('best.players', slices, id)

    const query = computed<CubeQuery>(() => {
      const isShowdown = slices.value.mode?.[0]?.toLowerCase().includes('showdown')
      return {
        cubeId: 'battle',
        dimensionsIds: ['player'],
        metricsIds: isShowdown ? ['picks', 'rank', 'brawler'] : ['wins', 'winRate', 'brawler'],
        slices: slices.value,
        sortId: isShowdown ? 'picks' : 'wins',
        limit: 50,
      }
    })

    return {
      query,
      title,
    }
  },
})
</script>
