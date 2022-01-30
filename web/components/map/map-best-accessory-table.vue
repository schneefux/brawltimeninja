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
          <d-gear v-bind="data"></d-gear>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import DBrawler from '@/components/klicker/d-brawler.vue'
import DGear from '@/components/klicker/d-gear.vue'
import { CQuery, VTable } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DBrawler,
    DGear,
    CQuery,
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
      metricsIds: ['wins', 'winRate'],
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
