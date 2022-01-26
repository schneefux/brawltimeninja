<template>
  <page :title="$t('leaderboard.player.metric.title', { metric: $t('metric.' + metric) })">
    <p>{{ $t('leaderboard.player.metric.description', { metric: $t('metric.' + metric) }) }}</p>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-105"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
        data-ad-format="auto"
        data-full-width-responsive="yes"
        ins-class="mt-3"
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

    <div class="flex justify-center">
      <b-card :title="`Best Players by ${metricName}`">
        <template v-slot:content>
          <p>
            {{ $t('leaderboard.player.description', { length: leaderboard.length }) }}
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
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-106"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5140154307"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { Leaderboard, LeaderboardEntry } from '@/model/Api'
import { camelToSnakeCase, capitalizeWords } from '@/lib/util'
import { PlayerRankTableRow } from '~/components/player/player-rank-table.vue'
import { BHorizontalScroller } from '@schneefux/klicker/components'

function formatMetric(m: string) {
  return capitalizeWords(camelToSnakeCase(m).replace(/_/g, ' '))
}

export default Vue.extend({
  components: {
    BHorizontalScroller,
  },
  head(): MetaInfo {
    const description = this.$tc('leaderboard.meta.description', 1, { metric: this.metricName })
    return {
      title: this.$tc('leaderboard.meta.title', 1, { metric: this.metricName }),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  meta: {
    title: 'Leaderboard',
    screen: 'profile',
  },
  middleware: ['cached'],
  data() {
    return {
      formatMetric,
      metric: '',
      metricName: '',
      metrics: [
        'hours',
        'trophies',
        'powerPlayPoints',
        'victories',
        'soloVictories',
        'duoVictories',
      ],
      leaderboard: [] as LeaderboardEntry[],
    }
  },
  async asyncData({ $http, $config, params }) {
    const metric = params.metric as string
    const leaderboard = await $http.$get<Leaderboard>($config.apiUrl + `/api/leaderboard/${metric}`)

    return {
      metric,
      metricName: formatMetric(metric),
      leaderboard: leaderboard.entries,
    }
  },
  computed: {
    rows(): PlayerRankTableRow[] {
      return this.leaderboard.map(e => ({
        player_name: e.name,
        player_tag: e.tag,
        player_icon_id: e.icon,
        [this.metric]: Math.floor(e.metric),
      }))
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>
