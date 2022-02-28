<template>
  <b-card
    slot="aside"
    :title="brawlerName"
  >
    <div
      slot="content"
      class="flex flex-col items-center"
    >
      <media-img
        :path="'/brawlers/' + brawlerId + '/model'"
        :alt="brawlerName"
      ></media-img>

      <c-query
        :query="{
          cubeId: 'map',
          metricsIds: ['winRate', 'useRate', 'picks'],
          dimensionsIds: ['brawler'],
          sortId: 'winRate',
          slices: {},
        }"
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
import { computed, defineComponent, useAsync } from '@nuxtjs/composition-api'
import { useKlicker } from '@schneefux/klicker/composables'
import { starRateMetric, useRateMetric, winRateMetric } from '~/lib/klicker.conf'
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
})
</script>
