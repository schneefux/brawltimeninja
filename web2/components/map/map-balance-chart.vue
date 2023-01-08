<template>
  <c-query :query="query">
    <template v-slot="data">
      <div class="contents">
        <b-dashboard-cell
          :columns="8"
          :rows="4"
          ssr-key="map-balance-chart-barplot"
          hide-empty
          lazy
        >
          <v-barplot
            v-bind="data"
            :card="{ title }"
          ></v-barplot>
        </b-dashboard-cell>
        <b-dashboard-cell
          :columns="3"
          :rows="2"
          ssr-key="map-balance-chart-gini"
          hide-empty
          lazy
        >
          <b-card :title="$t('metric.gini-coefficient')">
            <template v-slot:content><div >
              <v-gini
                v-bind="data"
              ></v-gini>
              <template v-slot:content><p
                
                class="mt-4"
              >
                {{ $t('brawler.balance-chart.description') }}
              </p></template>
            </div></template>
          </b-card>
        </b-dashboard-cell>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VBarplot, BDashboardCell } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from 'vue'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    BDashboardCell,
    VBarplot,
    CQuery,
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
    const query = computed(() => (<CubeQuery>{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: ['useRate'],
      slices: props.slices,
      sortId: 'useRate',
    }))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.balance-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
