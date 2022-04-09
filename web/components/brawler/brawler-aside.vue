<template>
  <b-card :title="brawlerName">
    <div
      slot="content"
      class="flex flex-col items-center"
    >
      <media-img
        :path="'/brawlers/' + brawlerId + '/model'"
        :alt="brawlerName"
        clazz="h-48 object-contain"
        size="400"
      ></media-img>

      <c-query
        :query="query"
        :filter="e => e.dimensionsRaw.brawler.brawler == brawlerName.toUpperCase()"
      >
        <template v-slot="data">
          <v-kv-table
            v-bind="data"
            class="mt-8 w-full"
          ></v-kv-table>
        </template>
      </c-query>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { CQuery, VKvTable } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VKvTable,
  },
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
  },
  setup() {
    const query = computed(() => ({
      cubeId: 'map',
      metricsIds: ['winRate', 'useRate', 'picks'],
      dimensionsIds: ['brawler'],
      sortId: 'winRate',
      slices: {},
    }))

    return {
      query,
    }
  },
})
</script>
