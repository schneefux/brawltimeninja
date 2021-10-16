<template>
  <c-query
    v-bind="$attrs"
    :state="state"
    :limit="limit"
  >
    <template v-slot="data">
      <v-table
        :title="title"
        v-bind="{ ...data, ...$attrs }"
      >
        <template v-slot:dimensions="data">
          <d-team v-bind="data"></d-team>
        </template>
      </v-table>
    </template>
  </c-query>
</template>

<script lang="ts">
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import { CQuery, VTable } from '~/klicker/components'
import { SliceValue, State } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VTable,
    DTeam,
    BrawlerTeam, // dependency of DTeam
    CQuery,
  },
  inheritAttrs: false,
  props: {
    id: {
      type: [Number, String],
      default: () => undefined
    },
    limit: {
      type: Number,
      default: 50
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const { id, slices } = toRefs(props)
    const title = useTopNTitle('best.teams', slices, id)

    const state = computed(() => (<State>{
      cubeId: 'battle',
      dimensionsIds: ['team'],
      measurementsIds: ['wins'],
      slices: {
        ...slices.value,
        teamSizeGt: slices.value.mode[0] == 'duoShowdown' ? ['1'] : ['2'],
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
