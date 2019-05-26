<template>
  <div class="flex flex-col items-center">
    <img
      :src="randomHero"
      class="mt-16 lg:mt-8 h-32 md:h-48 lg:h-64"
    >

    <div class="mt-10 lg:mt-6 text-center mx-2">
      <h1 class="text-4xl font-bold">
        How much time on Brawlstars?
      </h1>
    </div>

    <p class="mt-3 text-center text-lg mx-2">
      See how much you play, statistics for your Brawlers and more.
    </p>

    <div class="mt-4 mx-4">
      <form
        class="flex flex-wrap justify-center"
        @submit.prevent="search"
      >
        <div class="w-full flex justify-center">
          <div class="mt-3 py-2 border-2 rounded-lg border-primary-dark">
            <input
              v-model="tag"
              placeholder="Enter your Tag"
              type="text"
              autocomplete="off"
              class="w-40 md:w-48 tracking-wider uppercase font-semibold appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2"
            >
            <input
              type="submit"
              class="text-black font-semibold flex-shrink-0 bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 mr-3 rounded"
              value="Search"
            >
          </div>
        </div>
        <p
          v-if="loading"
          class="mt-2 text-red-lighter"
        >
          Searching…
        </p>
        <p
          v-if="error"
          class="mt-2 text-red-lighter"
        >
          {{ error }}
        </p>
      </form>
    </div>

    <div class="mt-3 text-center">
      <details
        ref="videoHelpDropdown"
        class="mx-6"
      >
        <summary @click="loadHelpVideo = true">
          Need help?
        </summary>
        <iframe
          v-if="loadHelpVideo"
          class="mt-3 max-w-full"
          width="480"
          height="271"
          frameborder="0"
          allow="encrypted-media; picture-in-picture"
          src="https://www.youtube-nocookie.com/embed/LuUmyorhSIQ?playlist=LuUmyorhSIQ&version=3&rel=0&fs=0&loop=1&playsinline=1"
        />
      </details>
    </div>

    <div class="my-4 text-center max-w-sm">
      <p class="text-grey">
        <span v-show="lastPlayers.length === 0">
          Or check one of these profiles:
        </span>
        <span v-show="lastPlayers.length > 0">
          Recently viewed:
        </span>
      </p>
      <p class="mt-2 mx-auto">
        <nuxt-link
          v-for="player in (lastPlayers.length === 0 ? randomPlayers : lastPlayers)"
          :key="player.tag"
          :to="playerToRoute(player)"
          rel="nofollow"
          class="ml-2 link"
        >
          {{ player.name }}
        </nuxt-link>
      </p>
    </div>

    <div
      v-show="relevantGuides.length > 0"
      class="mt-10 lg:mt-6 mb-6 container"
    >
      <blogroll
        :posts="relevantGuides"
        topic="guides"
        class="mx-6"
      />
    </div>
  </div>
</template>

<script>
import Blogroll from '~/components/blogroll'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

function playerToRoute(player) {
  return {
    name: 'player-tag',
    params: {
      tag: player.tag,
    }
  }
}

export default {
  components: {
    Blogroll,
  },
  head() {
    return {
      titleTemplate: null,
      title: 'Brawl Time Ninja',
    }
  },
  data() {
    return {
      tag: undefined,
      loading: false,
      error: undefined,
      invalidTagAttempts: 0,
      loadHelpVideo: false,
      playerToRoute,
    }
  },
  computed: {
    playerRoute() {
      return playerToRoute({
        tag: this.cleanedTag,
      })
    },
    tagRegex() {
      return new RegExp(this.tagPattern)
    },
    cleanedTag() {
      return (this.tag || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    },
    randomHero() {
      const heroes = ['crow1_optimized', 'crow2_optimized', 'crow3_optimized']
      const hero = heroes[Math.floor(Math.random() * heroes.length)]
      return require(`~/assets/images/hero/model/${hero}.png`)
    },
    randomPlayers() {
      const players = this.featuredPlayers.concat().sort(() => 0.5 - Math.random())
      return players.slice(0, 3)
    },
    ...mapState({
      tagPattern: state => state.tagPattern,
      lastPlayers: state => state.lastPlayers,
      featuredPlayers: state => state.featuredPlayers,
    }),
    ...mapGetters({
      relevantGuides: 'guidesForCurrentEvents',
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentEvents')
    }
  },
  mounted() {
    if (process.static) {
      this.loadCurrentEvents()
    }
  },
  methods: {
    async search() {
      this.error = undefined

      if (!this.tagRegex.test(this.cleanedTag)) {
        this.$ga.event('player', 'search', 'error_invalid')
        this.error = 'This is not a tag'

        this.invalidTagAttempts++
        if (this.invalidTagAttempts === 2) {
          this.$refs.videoHelpDropdown.setAttribute('open', '')
          this.loadHelpVideo = true
        }

        return
      }

      try {
        this.loading = true
        this.setPlayerTag(this.cleanedTag)
        await this.loadPlayer()
      } catch (error) {
        if (error.response.status === 404) {
          this.$ga.event('player', 'search', 'error_notfound')
          this.error = 'This tag does not exist'
        } else if (error.response.status === 429) {
          this.$ga.event('player', 'search', 'error_timeout')
          this.error = 'Either there was an error with the Brawlstars API, or this tag does not exist. Check it and try again'
        } else {
          this.$ga.exception('cannot get player: ' + error.message)
          this.$ga.event('player', 'search', 'error_api')
          this.error = 'Could not communicate with the Brawlstars API, try again later'
        }
        return
      } finally {
        this.loading = false
      }

      this.$ga.event('player', 'search', 'success')
      this.$router.push(this.playerRoute)
    },
    ...mapMutations({
      setPlayerTag: 'setPlayerTag',
    }),
    ...mapActions({
      loadPlayer: 'loadPlayer',
      loadCurrentEvents: 'loadCurrentEvents',
    }),
  },
}
</script>
