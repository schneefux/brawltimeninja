<template>
  <b-card :title="title">
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
import { defineComponent, computed, toRefs } from 'vue'
import { CQuery, VTierList } from '@schneefux/klicker/components'
import { CubeQuery } from '@schneefux/klicker/types'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    CQuery,
    VTierList,
  },
  props: {
    eventId: {
      type: [Number, String],
      default: () => undefined
    },
    slices: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { eventId, slices } = toRefs(props)
    const title = useTopNTitle('component.tier-list', slices, eventId)

    const query = computed<CubeQuery>(() => ({
      cubeId: 'survey',
      dimensionsIds: ['brawler'],
      metricsIds: ['picks'],
      slices: slices.value,
      sortId: 'picks',
    }))

    const totalsQuery = computed<CubeQuery>(() => ({
      cubeId: 'survey',
      dimensionsIds: [],
      metricsIds: ['picks', 'timestamp'],
      slices: slices.value,
      sortId: 'picks',
    }))

    return {
      query,
      totalsQuery,
      title
    }
  },
})
</script>
