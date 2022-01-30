<template>
  <c-query :query="query">
    <template v-slot="data">
      <b-card
        :title="title"
        full-height
      >
        <v-roll
          slot="content"
          v-bind="data"
          :card="{ elevation: 2 }"
        >
          <template
            v-if="kind != 'gears'"
            v-slot:dimensions="data"
          >
            <d-brawler v-bind="data"></d-brawler>
          </template>
        </v-roll>
      </b-card>
    </template>
  </c-query>
</template>

<script lang="ts">
import DPlayer from '@/components/klicker/d-player.vue'
import DBrawler from '@/components/klicker/d-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VRoll } from '@schneefux/klicker/components'
import { SliceValue, CubeQuery } from '@schneefux/klicker/types'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VRoll,
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
      metricsIds: ['winRate'],
      slices: {
        ...slices.value,
        [sliceMap[props.kind]]: ['0'],
      },
      sortId: 'winRate',
      limit: 5,
    }))

    return {
      query,
      title,
    }
  },
})
</script>
