<template>
  <c-query
    :query="query"
    :filter="filter"
  >
    <b-shimmer
      slot="placeholder"
      width-px="224"
      height-px="64"
      loading
    ></b-shimmer>
    <p slot="empty" class="text-center">
      {{ $t('state.no-data') }}
    </p>
    <template v-slot="data">
      <v-roll
        v-bind="{
          ...data,
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
import { CubeComparingQuery, CubeComparingQueryFilter } from 'klicker/types'
import { CQuery, VRoll } from 'klicker'

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
      cubeId: 'synergy',
      slices: {
        brawler: [props.brawler.toUpperCase()],
      },
      dimensionsIds: ['brawler', 'ally'],
      measurementsIds: ['winRate'],
      sortId: 'pvalue',
      limit: 10,
      reference: {
        cubeId: 'map',
        slices: {},
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRate'],
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
