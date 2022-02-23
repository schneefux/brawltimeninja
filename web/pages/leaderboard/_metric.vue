<template>
  <b-page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p>{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-105"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      ></adsense>
    </client-only>

    <b-horizontal-scroller
      class="mt-3"
      expand-on-desktop
    >
      <b-button
        v-for="metric in metrics"
        :key="metric"
        :to="localePath(`/leaderboard/${metric}`)"
        class="mt-2 mr-2 whitespace-nowrap"
        primary
        sm
      >
        {{ $t('metric.' + metric) }}
      </b-button>
    </b-horizontal-scroller>

    <div class="flex justify-center mt-8">
      <b-card
        v-if="!cubeMetrics.includes(metric)"
        :title="$t('leaderboard.by-metric', { metric: metricName })"
      >
        <template v-slot:content>
          <p>
            {{ $t('leaderboard.player.description', { length: rows.length }) }}
          </p>
          <div class="mt-2">
            <player-rank-table
              :columns="[metric]"
              :column-names="[metricName]"
              :rows="rows"
            ></player-rank-table>
          </div>
        </template>
      </b-card>
      <c-query
        v-else
        :query="{
          cubeId: 'battle',
          dimensionsIds: ['player'],
          metricsIds: [metric],
          slices: {
            season: [currentSeason],
          },
          sortId: metric,
          limit: 100,
        }"
      >
        <template v-slot="data">
          <v-table
            v-bind="data"
            :page-size="100"
            :card="{
              title: $t('leaderboard.by-metric', { metric: metricName }),
            }"
          >
            <template v-slot:dimensions="data">
              <d-player v-bind="data"></d-player>
            </template>
          </v-table>
        </template>
      </c-query>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-106"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5140154307"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="ad-section"
      />
    </client-only>
  </b-page>
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext, useRoute, computed, useAsync, useStore } from '@nuxtjs/composition-api'
import { Leaderboard } from '@/model/Api'
import { camelToSnakeCase, capitalizeWords, getSeasonEnd } from '@/lib/util'
import { PlayerRankTableRow } from '~/components/player/player-rank-table.vue'
import { CQuery, VTable, BHorizontalScroller } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CQuery,
    VTable,
    BHorizontalScroller,
  },
  head: {},
  setup() {
    const { i18n, $http, $config } = useContext()

    const route = useRoute()
    const metric = computed(() => route.value.params.metric as string)
    const metricName = computed(() => capitalizeWords(camelToSnakeCase(metric.value).replace(/_/g, ' ')))

    useMeta(() => {
      const description = i18n.tc('leaderboard.meta.description', 1, { metric: metricName.value })
      return {
        title: i18n.tc('leaderboard.meta.title', 1, { metric: metricName.value }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    const currentSeason = getSeasonEnd(new Date()).toISOString().slice(0, 10)

    const cubeMetrics = ['hours', 'victories', 'soloVictories', 'duoVictories']

    const fetchLeaderboard = async () => {
      console.log('fetch', metric.value)
      if (cubeMetrics.includes(metric.value)) {
        return []
      }
      const data = await $http.$get<Leaderboard>($config.apiUrl + `/api/leaderboard/${metric.value}`)
      return data.entries
    }
    const leaderboard = useAsync(fetchLeaderboard, 'leaderboard-' + metric.value)

    const metrics = [
      'hours',
      'trophies',
      'victories',
      'soloVictories',
      'duoVictories',
    ]

    const rows = computed<PlayerRankTableRow[]>(() => {
      return leaderboard.value?.map(e => ({
        player_name: e.name,
        player_tag: e.tag,
        player_icon_id: e.icon,
        [metric.value]: Math.floor(e.metric),
      })) ?? []
    })

    const store = useStore<any>()
    const isApp = computed(() => store.state.isApp as boolean)

    return {
      currentSeason,
      metric,
      cubeMetrics,
      metrics,
      metricName,
      leaderboard,
      rows,
      isApp,
    }
  },
  meta: {
    title: 'Leaderboard',
    screen: 'profile',
  },
  middleware: ['cached'],
})
</script>
