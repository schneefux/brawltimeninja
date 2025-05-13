<template>
  <b-card :title="$t('tier-list.mode.tier-list', { mode: $t('mode.' + mode) })">
    <template v-slot:content>
      <c-query :query="query">
        <template v-slot="data">
          <v-tier-list
            v-bind="data"
          ></v-tier-list>
        </template>
      </c-query>
      <c-query :query="totalsQuery">
        <template v-slot="data">
          <survey-tier-list-info
            v-bind="data"
            class="mt-6"
          ></survey-tier-list-info>
        </template>
      </c-query>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { BCard, CQuery, VTierList } from '@schneefux/klicker/components'
import { CubeQuery } from '@schneefux/klicker/types'
import { formatClickhouseDate, getMonthSeasonEnd } from '~/lib/util'

export default defineComponent({
  components: {
    BCard,
    CQuery,
    VTierList,
  },
  props: {
    mode: {
      type: String,
      required: false,
    },
  },
  setup(props) {
    const query = computed<CubeQuery>(() => ({
      cubeId: 'survey',
      dimensionsIds: ['brawler'],
      metricsIds: ['picks'],
      slices: {
        mode: props.mode ? [props.mode] : [],
        season: [formatClickhouseDate(getMonthSeasonEnd())],
      },
      sortId: 'picks',
    }))

    const totalsQuery = computed<CubeQuery>(() => ({
      cubeId: 'survey',
      dimensionsIds: [],
      metricsIds: ['picks', 'timestamp'],
      slices: {
        mode: props.mode ? [props.mode] : [],
        season: [formatClickhouseDate(getMonthSeasonEnd())],
      },
      sortId: 'picks',
    }))

    return {
      query,
      totalsQuery,
    }
  },
})
</script>
