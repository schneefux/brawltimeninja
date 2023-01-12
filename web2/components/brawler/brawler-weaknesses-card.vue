<template>
  <c-query
    :query="query"
    :filter="filter"
  >
    <template v-slot:empty><p  class="text-center">
      {{ $t('state.no-data') }}
    </p></template>
    <template v-slot="data">
      <v-roll
        v-bind="data"
        :card="{
          title: $t('brawler.weakness.title', { brawler }),
        }"
      ></v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { CubeComparingQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { CQuery, VRoll } from '@schneefux/klicker/components'
import { useContext } from '@/composables/compat'

export default defineComponent({
  components: {
    VRoll,
    CQuery,
  },
  props: {
    brawler: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const query: CubeComparingQuery = {
      name: i18n.t('metric.team'),
      comparing: true,
      cubeId: 'brawlerEnemies',
      slices: {
        brawler: [props.brawler.toUpperCase()],
      },
      dimensionsIds: ['brawler', 'enemy'],
      metricsIds: ['winRate'],
      sortId: 'pvalue',
      limit: 8,
      reference: {
        name: props.brawler,
        cubeId: 'map',
        slices: {},
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        sortId: 'winRate',
      },
    }

    const filter: CubeComparingQueryFilter = (e) => e.test.difference.pValueRaw <= 0.05

    return {
      filter,
      query,
    }
  },
})
</script>
