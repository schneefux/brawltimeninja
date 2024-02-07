<template>
  <b-card
    :elevation="0"
    dense
  >
    <template v-slot:content>
      <div class="h-full flex items-center gap-x-4">
        <media-img
          :path="`/brawlers/${brawlerMetadata.slug}/avatar`"
          :alt="brawlerMetadata.name"
          size="160"
          clazz="h-16 w-16 rounded-xl object-contain"
        ></media-img>
        <c-query
          :query="query"
          :filter="queryFilter"
        >
          <template v-slot="data">
            <v-kv-table
              v-bind="data"
              class="w-full"
            ></v-kv-table>
          </template>
        </c-query>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { CQuery, VKvTable } from '@schneefux/klicker/components'
import { SliceValue } from '@schneefux/klicker/types'
import { BrawlerMetadata } from '~/composables/dimension-values'

export default defineComponent({
  components: {
    VKvTable,
    CQuery,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: true
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
    },
  },
  setup(props) {
    const query = computed(() => ({
      cubeId: 'map',
      metricsIds: ['winRateAdj', 'useRate', 'picks'],
      dimensionsIds: ['brawler'],
      sortId: 'winRateAdj',
      slices: props.slices,
    }))

    const queryFilter = (e: any) => e.dimensionsRaw.brawler.brawler == props.brawlerMetadata.brawlstarsId

    return {
      queryFilter,
      query,
    }
  }
})
</script>
