<template>
  <c-query :query="query">
    <b-card
      slot="empty"
      :title="title"
      full-height
    >
      <p slot="content" class="text-center">
        {{ $t('state.no-data') }}
      </p>
    </b-card>
    <template v-slot="data">
      <div class="contents">
        <v-barplot
          v-bind="data"
          :card="{ title, fullHeight: true }"
          class="dashboard-cell"
          style="--columns: 4; --rows: 2;"
        ></v-barplot>
        <div
          class="dashboard-cell"
          style="--columns: 2; --rows: 1;"
        >
          <b-card
            :title="$t('metric.gini-coefficient')"
            full-height
            dense
          >
            <div slot="content">
              <v-gini v-bind="data"></v-gini>
              <p
                slot="content"
                class="mt-1 prose prose-invert leading-snug"
              >
                {{ $t('brawler.balance-chart.description') }}
              </p>
            </div>
          </b-card>
        </div>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VBarplot } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
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
