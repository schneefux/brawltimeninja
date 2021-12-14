<template>
  <c-query :query="query">
    <template v-slot="data">
      <div class="flex flex-wrap">
        <v-bar-plot
          :title="title"
          v-bind="data"
          class="h-72 flex-auto"
          full-height
        ></v-bar-plot>
        <div class="flex-auto flex lg:flex-col flex-wrap">
          <v-gini class="flex-auto lg:flex-none" v-bind="data"></v-gini>
          <b-card class="flex-auto lg:flex-none" size="w-44">
            <p
              slot="content"
              class="mb-2 prose text-gray-200"
            >
              {{ $t('brawler.balance-chart.description') }}
            </p>
          </b-card>
        </div>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VBarPlot } from '~/klicker/components'
import { SliceValue, CubeQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VBarPlot,
    DBrawler,
    CQuery,
    BrawlerLink,
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
        measurementsIds: ['useRate'],
        slices: props.slices,
        sortId: 'useRate',
      }
    ))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.balance-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
