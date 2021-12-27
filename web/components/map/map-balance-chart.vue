<template>
  <c-query :query="query">
    <template v-slot="data">
      <div class="flex flex-col md:flex-row">
        <v-barplot
          v-bind="data"
          :card="{ title, fullHeight: true }"
          class="flex-auto"
        ></v-barplot>
        <div class="flex lg:flex-col flex-wrap">
          <v-gini
            v-bind="data"
            :card="true"
            class="flex-auto lg:flex-none"
          ></v-gini>
          <b-card class="flex-auto lg:flex-none" size="w-44">
            <p
              slot="content"
              class="prose text-gray-200"
            >
              {{ $t('brawler.balance-chart.description') }}
            </p>
          </b-card>
        </div>
      </div>
    </template>
  </c-query>
</template>

<script lang="ts">
import { CQuery, VBarplot } from '~/klicker/components'
import { SliceValue, CubeQuery } from '~/klicker'
import { computed, defineComponent, PropType, toRefs } from '@nuxtjs/composition-api'
import useTopNTitle from '~/composables/top-n-title'

export default defineComponent({
  components: {
    VBarplot,
    CQuery,
  },
  props: {
    id: {
      type: [Number, String],
      default: () => undefined
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const query = computed(() => (<CubeQuery>{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['useRate'],
      slices: props.slices,
      sortId: 'useRate',
    }))

    const { id, slices } = toRefs(props)
    const title = useTopNTitle('brawler.balance-chart', slices, id)

    return {
      title,
      query,
    }
  },
})
</script>
