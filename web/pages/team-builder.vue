<template>
  <b-page
    :title="$t('draft-tool.title')"
    class="max-w-2xl mx-auto"
  >
    <b-card
      :title="$t('draft-tool.subtitle')"
      class="mt-3"
    >
      <p slot="content" class="prose dark:prose-invert">
        {{ $t('draft-tool.description') }}
      </p>
    </b-card>

    <c-slicer
      v-model="query"
      :components="['s-season', 's-mode-map', 's-trophies']"
      class="mt-8"
    ></c-slicer>

    <draft-grid
      :query="query"
      class="mt-8"
    ></draft-grid>

    <c-query
      :query="query"
      class="mt-8"
    >
      <template v-slot="totals">
        <div
          slot="brawlers"
          class="dashboard dashboard--responsive"
        >
          <c-dashboard-cell
            :rows="2"
            :columns="3"
          >
            <b-card :title="$t('about-metric', { metric: $t('metric.winRate') })">
              <p slot="content">{{ $t('brawler.disclaimer') }}</p>
            </b-card>
          </c-dashboard-cell>
          <c-dashboard-cell
            :rows="1"
            :columns="2"
          >
            <v-sample-size
              v-bind="totals"
              card
            ></v-sample-size>
          </c-dashboard-cell>
        </div>
      </template>
    </c-query>
  </b-page>
</template>

<script lang="ts">
import { CubeQuery } from '@schneefux/klicker/types'
import { BCard, CSlicer, CDashboardCell } from '@schneefux/klicker/components'
import DraftGrid from '~/components/draft-grid.vue'
import { formatClickhouseDate, getSeasonEnd } from '~/lib/util'
import { defineComponent, ref, useRoute } from '@nuxtjs/composition-api'
import { useKlicker } from '@schneefux/klicker/composables/klicker'

export default defineComponent({
  components: {
    CDashboardCell,
    DraftGrid,
    BCard,
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
  middleware: ['cached'],
  setup() {
    const route = useRoute()
    const { $klicker } = useKlicker()

    const season = new Date()
    season.setDate(season.getDate() - 7*4)

    const query = ref<CubeQuery>({
      cubeId: 'map',
      dimensionsIds: [],
      metricsIds: ['picks'],
      sortId: 'picks',
      slices: $klicker.convertLocationToSlices(route.value, {
        season: [formatClickhouseDate(getSeasonEnd(season))],
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
