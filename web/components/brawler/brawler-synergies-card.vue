<template>
  <c-query
    :query="query"
    :filter="filter"
  >
    <p slot="empty" class="text-center">
      {{ $t('state.no-data') }}
    </p>
    <template v-slot="data">
      <v-roll
        v-bind="data"
        :card="{
          title: $t('brawler.synergy.title', { brawler }),
          elevation: 1,
        }"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { CubeComparingQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { CQuery, VRoll } from '@schneefux/klicker/components'

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
    const query: CubeComparingQuery = {
      comparing: true,
      cubeId: 'brawler_allies',
      slices: {
        brawler: [props.brawler.toUpperCase()],
      },
      dimensionsIds: ['brawler', 'ally'],
      metricsIds: ['winRate'],
      sortId: 'pvalue',
      limit: 15,
      reference: {
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
