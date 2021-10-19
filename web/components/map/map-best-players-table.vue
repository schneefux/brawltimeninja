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
            <d-player v-bind="data"></d-player>
          </template>
          <template v-slot:[`measurements.brawler`]="data">
            <m-brawler v-bind="data"></m-brawler>
          </template>
        </v-table>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import DPlayer from '@/components/klicker/d-player.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'
import { defineComponent, toRefs, PropType, computed } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DPlayer,
    MBrawler,
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
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const { id, slices } = toRefs(props)
    const title = useTopNTitle('best.players', slices, id)

    const state = computed(() => {
      const isShowdown = slices.value.mode?.[0]?.toLowerCase().includes('showdown')
      return <State>{
        cubeId: 'battle',
        dimensionsIds: ['player'],
        measurementsIds: isShowdown ? ['picks', 'rank', 'brawler'] : ['wins', 'winRate', 'brawler'],
        slices: slices.value,
        sortId: isShowdown ? 'picks' : 'wins',
        limit: 50,
      }
    })

    return {
      state,
      title,
    }
  },
})
</script>
