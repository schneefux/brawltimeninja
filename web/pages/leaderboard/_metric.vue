<template>
  <c-query
    :query="{
      cubeId: 'battle',
      dimensionsIds: ['player'],
      metricsIds: [metric],
      slices: {
        season: [currentSeason],
      },
      sortId: metric,
      limit: 100,
    }"
  >
    <template v-slot="data">
      <v-table
        v-bind="data"
        :page-size="100"
        :card="{
          title: $t('leaderboard.by-metric', { metric: $t('metric.' + metric) }),
        }"
      >
        <template v-slot:dimensions="data">
          <d-player v-bind="data"></d-player>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent, useRoute, computed } from '@nuxtjs/composition-api'
import { getSeasonEnd } from '@/lib/util'
import { CQuery, VTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VTable,
  },
  setup() {
    const route = useRoute()
    const metric = computed(() => route.value.params.metric as string)

    const currentSeason = getSeasonEnd(new Date()).toISOString().slice(0, 10)

    return {
      currentSeason,
      metric,
    }
  },
  middleware: ['cached'],
})
</script>
