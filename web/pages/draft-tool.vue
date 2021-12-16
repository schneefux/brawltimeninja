<template>
  <page
    title="Draft Helper"
    class="max-w-2xl mx-auto"
  >
    <b-card
      title="Title"
      class="mt-3"
    >
      <p slot="content" class="prose text-gray-200">
        <i>A short introduction to the tool.</i>
      </p>
    </b-card>

    <div>
      <c-slicer v-model="query">
        <template v-slot="data">
          <s-season v-bind="data"></s-season>
          <s-trophies v-bind="data"></s-trophies>
          <s-mode-map v-bind="data"></s-mode-map>
        </template>
      </c-slicer>

      <draft-grid :query="query"></draft-grid>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { CubeQuery } from '~/klicker'
import { CSlicer } from '~/klicker/components'
import DraftGrid from '~/components/draft-grid.vue'
import { getSeasonEnd } from '~/lib/util'

export default Vue.extend({
  components: {
    DraftGrid,
    CSlicer,
  },
  head() {
    const description = ''
    return {
      title: '',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Draft Helper',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  data() {
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)

    return {
      query: <CubeQuery>{
        // TODO
        cubeId: '',
        dimensionsIds: [],
        measurementsIds: [],
        sortId: '',
        slices: {
          season: [currentSeason.toISOString().slice(0, 10)],
          trophyRangeGte: ['0'],
          mode: [],
        },
      },
    }
  },
})
</script>
