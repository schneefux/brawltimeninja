<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
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
import { defineComponent, useRoute, computed } from '@nuxtjs/composition-api'
import { formatClickhouseDate, getTodaySeasonEnd } from '@/lib/util'
import { CQuery, VTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VTable,
  },
  setup() {
    const route = useRoute()
    const metric = computed(() => {
      // FIXME when leaving the route, this computed property gets refreshed and brawler is undefined
      return route.value.params.metric ?? ''
    })

    const currentSeason = formatClickhouseDate(getTodaySeasonEnd())
    const query = computed(() => ({
      cubeId: 'battle',
      dimensionsIds: ['player'],
      metricsIds: [metric.value],
      slices: {
        season: [currentSeason],
      },
      sortId: metric.value,
      limit: 100,
    }))

    return {
      query,
      metric,
    }
  },
  middleware: ['cached'],
})
</script>
