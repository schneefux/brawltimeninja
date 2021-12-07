<template>
  <page
    title="Draft Helper"
    class="max-w-2xl mx-auto"
  >
    <b-card
      title="Title"
      class="mt-3"
    >
      <p slot="content" class="mb-2 prose text-gray-200">
        <i>A short introduction to the tool.</i>
      </p>
    </b-card>

    <div>
      <draft-grid></draft-grid>
    </div>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from '~/klicker'
import { CDashboard, BCard, CMetric, VTable, VCsv, VPivotCsv } from '~/klicker/components'
import DTeam from '@/components/klicker/d-team.vue'
import BrawlerTeam from '@/components/brawler/brawler-team.vue'
import DraftGrid from '~/components/draft-grid.vue'

export default Vue.extend({
  components: {
    CDashboard,
    BCard,
    CMetric,
    VTable,
    VCsv,
    VPivotCsv,
    DTeam,
    BrawlerTeam, // dependency of DTeam
    DraftGrid,
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
    return {
      state: <State>{
        cubeId: 'battle',
        dimensionsIds: ['team'],
        measurementsIds: ['wins'],
        slices: {
        },
        sortId: 'wins',
        limit: 10,
      },
    }
  },
})
</script>
