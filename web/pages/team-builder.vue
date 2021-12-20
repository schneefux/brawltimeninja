<template>
  <page
    :title="$t('draft-tool.title')"
    class="max-w-2xl mx-auto"
  >
    <b-card
      :title="$t('draft-tool.subtitle')"
      class="mt-3"
    >
      <p slot="content" class="prose text-gray-200">
        {{ $t('draft-tool.description') }}
      </p>
    </b-card>

    <div>
      <c-slicer v-model="query">
        <template v-slot="data">
          <s-season v-bind="data"></s-season>
          <s-mode-map v-bind="data"></s-mode-map>
          <s-trophies v-bind="data"></s-trophies>
        </template>
      </c-slicer>

      <draft-grid :query="query"></draft-grid>

      <c-query
        :query="query"
      >
        <template v-slot="totals">
          <v-sample-size v-bind="totals"></v-sample-size>
        </template>
      </c-query>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { CubeQuery } from '~/klicker'
import { CSlicer } from '~/klicker/components'
import DraftGrid from '~/components/draft-grid.vue'
import { getSeasonEnd } from '~/lib/util'
import { convertToSlices } from '~/klicker/composables/link'

export default Vue.extend({
  components: {
    DraftGrid,
    CSlicer,
  },
  head() {
    const description = this.$t('draft-tool.meta.description') as string
    return {
      title: this.$t('draft-tool.meta.title') as string,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Team Builder',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  data() {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    return {
      query: <CubeQuery>{
        cubeId: 'map',
        dimensionsIds: [],
        measurementsIds: ['picks'],
        sortId: 'picks',
        slices: convertToSlices(this.$route, {
          season: [currentSeason.toISOString().slice(0, 10)],
          trophyRangeGte: ['0'],
          mode: [],
        }),
      },
    }
  },
})
</script>
