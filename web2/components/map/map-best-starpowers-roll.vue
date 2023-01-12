<template>
  <b-card
    :title="$tc('best.' + kind, 1)"
    :elevation="elevation"
    :link="`/tier-list/${kind}`"
  >
    <template v-slot:content><c-query

      :query="query"
      :filter="filter"
    >
      <template v-slot="data">
        <v-roll v-bind="data"></v-roll>
      </template>
    </c-query></template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { SliceValue, CubeComparingQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'|'gears'>,
      default: 'starpowers'
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 4
    },
    elevation: {
      type: Number,
      default: 1
    },
  },
  setup(props) {
    const keys = {
      'starpowers': 'starpower',
      'gadgets': 'gadget',
      'gears': 'gear',
    }
    const kindKey = computed(() => keys[props.kind])
    const query = computed<CubeComparingQuery>(() => ({
      comparing: true,
      cubeId: 'battle',
      sortId: 'difference',
      dimensionsIds: props.kind == 'gears' ? [keys[props.kind]] : ['brawler', keys[props.kind]],
      metricsIds: ['winRate'],
      slices: {
        ...props.slices,
        [keys[props.kind] + 'IdNeq']: ['0'],
      },
      limit: props.limit,
      reference: {
        cubeId: 'battle',
        dimensionsIds: props.kind == 'gears' ? [] : ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          ...props.slices,
          [keys[props.kind] + 'IdEq']: ['0'],
        },
        sortId: 'difference',
      },
    }))

    const filter: CubeComparingQueryFilter = (e) => e.test.difference.pValueRaw <= 0.05

    return {
      query,
      filter,
      kindKey,
    }
  },
})
</script>
