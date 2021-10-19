<template>
  <c-query :state="state">
    <template v-slot="data">
      <v-scatter-plot
        :title="title"
        v-bind="data"
        class="h-72 flex-auto"
        full-height
      ></v-scatter-plot>
    </template>
  </c-query>
</template>

<script lang="ts">
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VScatterPlot } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VScatterPlot,
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
    const state = computed(() => (<State>{
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: ['useRate', 'winRate'],
        slices: props.slices,
        sortId: 'useRate',
      }
    ))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.winrate-userate-chart', slices, id)

    return {
      title,
      state,
    }
  },
})
</script>
