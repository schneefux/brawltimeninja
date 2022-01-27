<template>
  <b-card
    :title="$tc('best.' + kind, 1)"
    :elevation="elevation"
  >
    <b-button
      slot="actions"
      :to="localePath(`/tier-list/${kind}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.tier-list.' + kindKey) }}
    </b-button>

    <c-query
      slot="content"
      :query="query"
      :filter="filter"
    >
      <b-shimmer
        slot="placeholder"
        width-px="224"
        height-px="64"
        loading
      ></b-shimmer>
      <template v-slot="data">
        <v-roll
          v-bind="{
            ...data,
            ...$attrs,
            elevation: elevation + 1,
          }"
        >
          <template v-slot:dimensions="data">
            <d-brawler v-bind="data"></d-brawler>
          </template>
        </v-roll>
      </template>
    </c-query>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue, CubeComparingQuery, CubeComparingQueryFilter } from '@schneefux/klicker/types'
import { VRoll, BShimmer, CQuery, BButton } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  inheritAttrs: false,
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
    limit: {
      type: Number,
      default: 3
    },
    elevation: {
      type: Number,
      default: 1
    },
  },
  setup(props) {
    const kindKey = computed(() => props.kind == 'starpowers' ? 'starpower' : 'gadget')
    const query = computed<CubeComparingQuery>(() => ({
      comparing: true,
      cubeId: 'battle',
      sortId: 'difference',
      dimensionsIds: props.kind == 'starpowers' ? ['brawler', 'starpower'] : ['brawler', 'gadget'],
      metricsIds: ['winRate'],
      slices: {
        ...props.slices,
        [props.kind == 'starpowers' ? 'starpowerIdNeq' : 'gadgetIdNeq']: ['0'],
      },
      limit: props.limit,
      reference: {
        cubeId: 'battle',
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          ...props.slices,
          [props.kind == 'starpowers' ? 'starpowerIdEq' : 'gadgetIdEq']: ['0'],
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
