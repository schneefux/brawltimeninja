<template>
  <div class="w-120 max-w-full mx-auto py-4 px-2">
    <div class="bg-grey-lighter py-8 px-6 my-8 text-black">
      <h1 class="text-4xl md:text-center mt-2 font-semibold">
        Brawl Stars Leaderboards
      </h1>

      <p class="mt-2">
        The best players are ranked by the most hours and most trophies in this leaderboard.
      </p>

      <adsense
        v-if="ads"
        id="ezoic-pub-ad-placeholder-105"
        root-class="mt-6"
        ins-class="h-24"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4579727583"
      />

      <div class="text-center my-2">
        <button @click="metric = 'hours'" class="bg-primary-lighter px-2 py-1 rounded">Load Most Hours</button>
        <button @click="metric = 'trophies'" class="bg-primary-lighter px-2 py-1 rounded">Load Most Trophies</button>
      </div>

      <table class="mt-8 mx-auto w-64 max-w-full table">
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
            <th scope="col" class="text-right capitalize">
              {{ metric }}
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
                class="link-light"
              >
                {{ entry.name }}
              </nuxt-link>
            </td>
            <td class="text-right">
              {{ Math.floor(entry[metric]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <adsense
        v-if="ads && !isApp"
        id="ezoic-pub-ad-placeholder-106"
        root-class="mt-4"
        ins-class="h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5140154307"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'LeaderboardPage',
  head() {
    const description = 'Brawl Stars Leaderboard. Player rankings by most hours and most trophies.'
    return {
      title: 'Brawl Stars Leaderboard',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  computed: {
    ...mapState({
      hoursLeaderboard: state => state.leaderboard,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadLeaderboard')
    }
  },
  data() {
    return {
      metric: 'hours',
      leaderboard: [],
    }
  },
  watch: {
    async metric() {
      this.leaderboard = []

      if (this.metric == 'hours') {
        this.leaderboard = this.hoursLeaderboard.slice()
      }
      if (this.metric == 'trophies') {
        this.leaderboard = await this.$axios.$get('/api/leaderboard/trophies')
      }
    }
  },
  created() {
    if (process.static) {
      this.loadLeaderboard()
    }
    this.leaderboard = this.hoursLeaderboard.slice()
  },
  methods: {
    ...mapActions({
      loadHoursLeaderboard: 'loadLeaderboard',
    }),
  },
}
</script>

<style scoped>
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
