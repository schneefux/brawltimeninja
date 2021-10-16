<template>
  <c-query
    v-bind="$attrs"
    :state="state"
    :limit="50"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
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
import MBrawler from '@/components/klicker/m-brawler.vue'
import BrawlerLink from '@/components/brawler/brawler-link.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'
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
    const title = useTopNTitle('best.gadgets', slices, id)

    const state = computed(() => (<State>{
      cubeId: 'battle',
      dimensionsIds: ['gadget'],
      measurementsIds: ['wins'],
      slices: {
        ...slices.value,
        gadgetIdNeq: ['0'],
      },
      sortId: 'wins',
    }))

    return {
      state,
      title,
    }
  },
})
</script>
