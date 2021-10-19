<template>
  <c-query :state="state">
    <template v-slot="data">
      <!-- add wrapper div to work around SSR error -->
      <div class="contents">
        <v-table
          :title="title"
          v-bind="{ ...data, ...$attrs }"
        >
          <template v-slot:dimensions="data">
            <d-brawler v-bind="data"></d-brawler>
          </template>
        </v-table>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DBrawler,
    CQuery,
    BrawlerLink,
  },
  inheritAttrs: false,
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
    const { id, slices } = toRefs(props)
    const title = useTopNTitle('best.brawlers', slices, id)

    const state = computed(() => (<State>{
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRateAdj', 'useRate'],
        slices: slices.value,
        sortId: 'winRateAdj',
      }
    ))

    return {
      state,
      title,
    }
  },
})
</script>
