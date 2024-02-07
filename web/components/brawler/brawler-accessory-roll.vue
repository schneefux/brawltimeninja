<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-roll
        v-bind="data"
        :card="{}"
      ></v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VRoll } from '@schneefux/klicker/components'
import { CubeComparingQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
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
      cubeId: dimensionMap[props.kind],
      dimensionsIds: ['brawler', dimensionMap[props.kind]],
      metricsIds: ['winRate'],
      slices: {
        brawler: [props.brawlerBrawlstarsId],
        [sliceNeqMap[props.kind]]: ['0'],
      },
      sortId: 'pvalue',
      comparing: true,
      reference: {
        name: i18n.t('brawler.no-gear'),
        cubeId: dimensionMap[props.kind],
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        slices: {
          brawler: [props.brawlerBrawlstarsId],
          [sliceEqMap[props.kind]]: ['0'],
        },
        sortId: 'pvalue',
      },
    }))

    return {
      query,
    }
  },
})
</script>
