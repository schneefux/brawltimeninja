<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-table
        v-bind="data"
        :card="{ title }"
        link-path="/dashboard"
      ></v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VTable } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from 'vue'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    CQuery,
  },
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'|'gears'>,
      default: 'starpowers'
    },
    eventId: {
      type: [Number, String],
      default: () => undefined
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const { eventId, slices } = toRefs(props)
    const title = useTopNTitle('best.' + props.kind, slices, eventId)

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
