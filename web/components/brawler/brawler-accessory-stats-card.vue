<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-roll
        v-if="data.response.data.length <= 3"
        v-bind="data"
        :card="{}"
      ></v-roll>
      <v-table
        v-else
        v-bind="data"
        :card="{}"
        :page-size="3"
      ></v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VTable, VRoll } from '@schneefux/klicker/components'
import { CubeComparingQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    VTable,
    VRoll,
    CQuery,
  },
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'|'gears'>,
      required: true
    },
    brawlerBrawlstarsId: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const dimensionMap = {
      starpowers: 'starpower',
      gadgets: 'gadget',
      gears: 'gear',
    }
    const sliceNeqMap = {
      starpowers: 'starpowerIdNeq',
      gadgets: 'gadgetIdNeq',
      gears: 'gearIdNeq',
    }
    const sliceEqMap = {
      starpowers: 'starpowerIdEq',
      gadgets: 'gadgetIdEq',
      gears: 'gearIdEq',
    }

    const i18n = useI18n()
    const query = computed<CubeComparingQuery>(() => ({
      name: '',
      // materialized cubes are already filtered for <= 1 accessory owned
      cubeId: dimensionMap[props.kind],
      dimensionsIds: ['brawler', dimensionMap[props.kind]],
      metricsIds: ['winRate'],
      slices: {
        brawler: [props.brawlerBrawlstarsId],
        // FIXME 2025-03-18: at trophy range 0, win rates with 0 accessories are much higher (outliers)
        trophyRangeGte: ['1'],
        [sliceNeqMap[props.kind]]: ['0'],
      },
      sortId: 'winRate',
      comparing: true,
      reference: {
        name: i18n.t('brawler.no-' + dimensionMap[props.kind]),
        cubeId: dimensionMap[props.kind],
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          brawler: [props.brawlerBrawlstarsId],
          trophyRangeGte: ['1'],
          [sliceEqMap[props.kind]]: ['0'],
        },
        sortId: 'winRate',
      },
    }))

    return {
      query,
    }
  },
})
</script>
