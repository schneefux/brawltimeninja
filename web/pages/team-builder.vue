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

      <c-query :query="query">
        <template v-slot="totals">
          <v-sample-size
            v-bind="totals"
            :card="{}"
          ></v-sample-size>
        </template>
      </c-query>
    </div>
  </page>
</template>

<script lang="ts">
import { CubeQuery } from '~/klicker'
import { CSlicer } from '~/klicker/components'
import DraftGrid from '~/components/draft-grid.vue'
import { getSeasonEnd } from '~/lib/util'
import { convertToSlices } from '~/klicker/composables/link'
import { defineComponent, ref, useRoute } from '@nuxtjs/composition-api'

export default defineComponent({
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
  setup() {
    const route = useRoute()

    const season = new Date()
    season.setDate(season.getDate() - 7*4)
    const seasonSlice = getSeasonEnd(season).toISOString().slice(0, 10)

    const query = ref<CubeQuery>({
      cubeId: 'map',
      dimensionsIds: [],
      measurementsIds: ['picks'],
      sortId: 'picks',
      slices: convertToSlices(route.value, {
        season: [seasonSlice],
        trophyRangeGte: ['0'],
        mode: [],
      }),
    })

    return {
      query,
    }
  },
})
</script>
