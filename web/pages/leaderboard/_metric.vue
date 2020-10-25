<template>
  <div class="page container">
    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-105"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div class="section-heading">
      <h1 class="page-h1">Brawl Stars {{ metricName }} Leaderboard</h1>

      <p>
        The best players are ranked by {{ metricName }} in this leaderboard.
      </p>

      <div class="overflow-x-auto scrolling-touch flex md:justify-center md:flex-wrap">
        <nuxt-link
          v-for="metric in metrics"
          :key="metric"
          class="button button--secondary button--md mt-2 mr-2 whitespace-no-wrap"
          :to="`/leaderboard/${metric}`"
        >
          {{ formatMetric(metric) }} Leaderboard
        </nuxt-link>
      </div>
    </div>

    <div class="section flex justify-center">
      <div class="card card--dark card__content">
        <table class="w-64 max-w-full table">
          <caption class="mb-1">
            Top {{ leaderboard.length }} players, updated hourly
          </caption>
          <thead>
            <tr>
              <th scope="col" class="text-right">
                #
              </th>
              <th scope="col" class="text-left">
                Name
              </th>
              <th scope="col" class="text-right">
                {{ metricName }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(entry, index) in leaderboard"
              :key="entry.tag"
            >
              <th scope="row" class="text-right">
                {{ index + 1 }}
              </th>
              <td class="font-semibold">
                <nuxt-link
                  :to="`/player/${entry.tag}`"
                  class="link"
                >
                  <media-img
                    v-if="entry.icon"
                    :path="`/avatars/${entry.icon}`"
                    clazz="h-8 inline mr-1"
                  ></media-img>
                  {{ entry.name }}
                </nuxt-link>
              </td>
              <td class="text-right">
                {{ Math.floor(entry.metric) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'
import { Leaderboard, LeaderboardEntry } from '../../model/Api'
import { camelToSnakeCase, capitalizeWords } from '../../lib/util'

function formatMetric(m: string) {
  return capitalizeWords(camelToSnakeCase(m).replace(/_/g, ' '))
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars ${(<any>this).metricName} Leaderboard. Players ranked by most ${(<any>this).metricName}.`
    return {
      title: `Brawl Stars ${(<any>this).metricName} Leaderboard`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      formatMetric,
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
  async asyncData({ $axios, params }) {
    const metric = params.metric as string
    const leaderboard = await $axios.$get<Leaderboard>(`/api/leaderboard/${metric}`)

    return {
      metricName: formatMetric(metric),
      leaderboard: leaderboard.entries,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
})
</script>

<style scoped lang="postcss">
.table th {
  @apply py-2 px-2;
}

.table td {
  @apply py-4 px-2;
}

.table tbody td, tbody th {
  @apply border-t border-grey-light;
}
</style>
