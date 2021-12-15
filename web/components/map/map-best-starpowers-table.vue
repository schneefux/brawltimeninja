<template>
  <c-query :query="query">
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
import DPlayer from '@/components/klicker/d-player.vue'
import DBrawler from '@/components/klicker/d-brawler.vue'
import MBrawler from '@/components/klicker/m-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, CubeQuery, ComparingMetaGridEntry, CubeComparingQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DPlayer,
    DBrawler,
    MBrawler,
    CQuery,
    BrawlerLink,
  },
  inheritAttrs: false,
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
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
    const title = useTopNTitle('best.' + props.kind, slices, id)

    const query = computed<CubeQuery>(() => ({
      cubeId: 'battle',
      dimensionsIds: props.kind == 'starpowers' ? ['starpower'] : ['gadget'],
      measurementsIds: ['wins', 'winRate'],
      slices: {
        ...slices.value,
        [props.kind == 'starpowers' ? 'starpowerIdNeq' : 'gadgetIdNeq']: ['0'],
      },
      sortId: 'wins',
      limit: 50,
    }))

    return {
      query,
      title,
    }
  },
})
</script>
