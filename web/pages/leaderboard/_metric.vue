<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
        id="table"
        v-bind="data"
        :page-size="100"
        :card="{
          title: $t('leaderboard.by-metric', { metric: $t('metric.' + metric) }),
        }"
      ></v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { formatClickhouseDate, getTodaySeasonEnd } from '@/lib/util'
import { CQuery, VTable } from '@schneefux/klicker/components'
import { useRoute } from 'vue-router'
import { useCacheHeaders } from '@/composables/compat'
import { CubeQuery } from '@schneefux/klicker/types'

export default defineComponent({
  components: {
    CQuery,
    VTable,
  },
  setup() {
    const route = useRoute()
    const metric = computed(() => {
      // FIXME when leaving the route, this computed property gets refreshed and brawler is undefined
      return route.params.metric as string ?? ''
    })

    const currentSeason = formatClickhouseDate(getTodaySeasonEnd())
    const query = computed<CubeQuery>(() => ({
      cubeId: 'battle',
      dimensionsIds: ['player'],
      metricsIds: [metric.value],
      slices: {
        season: [currentSeason],
      },
      sortId: metric.value,
      limit: 100,
    }))

    useCacheHeaders()

    return {
      query,
      metric,
    }
  },
})
</script>
