<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
        v-bind="data"
        :card="{ title, fullHeight: true, ...$attrs }"
        link-path="/dashboard"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import DPlayer from '@/components/klicker/d-player.vue'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from 'klicker/components'
import { SliceValue, CubeQuery } from 'klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DPlayer,
    DBrawler,
    CQuery,
    BrawlerLink,
  },
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'|'gears'>,
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

    const dimensionMap = {
      starpowers: 'starpower',
      gadgets: 'gadget',
      gears: 'gear',
    }
    const sliceMap = {
      starpowers: 'starpowerIdNeq',
      gadgets: 'gadgetIdNeq',
      gears: 'gearIdNeq',
    }

    const query = computed<CubeQuery>(() => ({
      cubeId: 'battle',
      dimensionsIds: [dimensionMap[props.kind]],
      measurementsIds: ['wins', 'winRate'],
      slices: {
        ...slices.value,
        [sliceMap[props.kind]]: ['0'],
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
