<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
        v-bind="data"
        :card="{ title, fullHeight: true, ...$attrs }"
        link-path="/dashboard"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DBrawler,
    CQuery,
    BrawlerLink,
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
    const { id, slices } = toRefs(props)
    const title = useTopNTitle('best.brawlers', slices, id)

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
