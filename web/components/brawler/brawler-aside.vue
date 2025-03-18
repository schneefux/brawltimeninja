<template>
  <b-card :title="brawlerMetadata?.name">
    <template v-slot:content>
      <div class="flex flex-col md:flex-row gap-8">
        <b-shimmer
          v-if="brawlerMetadata == undefined"
          height-px="192"
          loading
        ></b-shimmer>
        <media-img
          v-else
          :path="`/brawlers/${brawlerMetadata.slug}/model`"
          :alt="brawlerMetadata.name"
          clazz="h-48 object-contain"
          size="400"
        ></media-img>

        <c-query
          :query="query"
          :filter="filter"
        >
          <template v-slot="data">
            <v-kv-table
              v-bind="data"
              class="mt-8 w-full"
            ></v-kv-table>
          </template>
        </c-query>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { PropType, computed, defineComponent } from 'vue'
import { CQuery, VKvTable, BShimmer } from '@schneefux/klicker/components'
import { CubeQueryFilter } from '@schneefux/klicker/types'
import { BrawlerMetadata } from '~/composables/dimension-values'

export default defineComponent({
  components: {
    CQuery,
    VKvTable,
    BShimmer,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: false
    },
  },
  setup(props) {
    const query = {
      cubeId: 'map',
      metricsIds: ['winRate', 'useRate', 'picks'],
      dimensionsIds: ['brawler'],
      sortId: 'winRate',
      slices: {},
    }

    const filter = computed<CubeQueryFilter>(() => (e) => e.dimensionsRaw.brawler.brawler == props.brawlerMetadata?.brawlstarsId)

    return {
      query,
      filter,
    }
  },
})
</script>
