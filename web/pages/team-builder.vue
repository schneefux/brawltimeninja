<template>
  <split-page :title="$t('draft-tool.title')">
    <b-card
      :title="$t('draft-tool.subtitle')"
      class="mt-3"
    >
      <template v-slot:content>
        <p class="prose dark:prose-invert">
          {{ $t('draft-tool.description') }}
        </p>
        <p class="mt-4 prose dark:prose-invert">
          {{ $t('brawler.disclaimer') }}
        </p>
      </template>
    </b-card>

    <ad kind="first"></ad>

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
        <b-dashboard responsive>
          <b-dashboard-cell
            :rows="1"
            :columns="2"
          >
            <v-sample-size
              v-bind="totals"
              :card="{}"
            ></v-sample-size>
          </b-dashboard-cell>
        </b-dashboard>
      </template>
    </c-query>

    <prodigy-ad
      class="mt-8"
    ></prodigy-ad>
  </split-page>
</template>

<script lang="ts">
import { CubeQuery } from '@schneefux/klicker/types'
import { BCard, BDashboard, CSlicer, BDashboardCell } from '@schneefux/klicker/components'
import DraftGrid from '~/components/draft-grid.vue'
import { formatClickhouseDate, getSeasonEnd } from '~/lib/util'
import { defineComponent, ref } from 'vue'
import { useKlicker } from '@schneefux/klicker/composables/klicker'
import { useRoute } from 'vue-router'
import { mapRouteQuery } from '~/composables/link'
import { useCacheHeaders, useMeta } from '~/composables/compat'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    BDashboardCell,
    BDashboard,
    DraftGrid,
    BCard,
    CSlicer,
  },
  setup() {
    const route = useRoute()
    const $klicker = useKlicker()

    const season = new Date()
    season.setDate(season.getDate() - 7*4)

    const query = ref<CubeQuery>({
      cubeId: 'map',
      dimensionsIds: [],
      metricsIds: ['picks'],
      sortId: 'picks',
      slices: $klicker.convertLocationToSlices(mapRouteQuery(route), {
        season: [formatClickhouseDate(getSeasonEnd(season))],
        trophyRangeGte: ['0'],
        mode: [],
      }),
    })

    useCacheHeaders()

    const i18n = useI18n()
    useMeta(() => ({
      title: i18n.t('draft-tool.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('draft-tool.meta.description') },
      ]
    }))

    return {
      query,
    }
  },
})
</script>
