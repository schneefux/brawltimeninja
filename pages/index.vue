<template>
  <div class="flex flex-col items-center">
    <img class="mt-16 lg:mt-8 h-32 md:h-48 lg:h-64" :src="randomHero">

    <div class="mt-10 lg:mt-6 text-center font-sans mx-2">
      <h1>How much time on Brawlstars?</h1>
    </div>

    <p class="mt-3 text-center text-lg mx-2">See how much you play, statistics for your Brawlers and more.</p>

    <div class="mt-4 mx-4">
      <form
        @submit.prevent="submitName"
        class="flex flex-wrap justify-center">
        <div class="w-full flex justify-center">
          <div class="mt-3 py-2 border-2 rounded-lg border-primary-dark">
            <input
              v-model="name"
              placeholder="Enter your Tag"
              type="text"
              class="w-40 md:w-48 tracking-wide font-black appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2">
            <input
              type="submit"
              class="text-black font-semibold flex-no-shrink bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 mr-3 rounded"
              value="Search">
          </div>
        </div>
        <p class="mt-2 text-red-lighter" v-if="nameLoading">
          Searching…
        </p>
        <p class="mt-2 text-red-lighter" v-if="nameNotFound">
          Not found, please check again
        </p>
      </form>
    </div>

    <div class="mt-3 text-center">
      <details>
        <summary @click="loadNameHelpVideo = true">Need help?</summary>
        <iframe
          v-if="loadNameHelpVideo"
          class="mt-3"
          width="480"
          height="271"
          frameborder="0"
          allow="encrypted-media; picture-in-picture"
          src="https://www.youtube-nocookie.com/embed/LuUmyorhSIQ?playlist=LuUmyorhSIQ&version=3&rel=0&fs=0&loop=1&playsinline=1">
        </iframe>
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
          v-for="player in (lastPlayers.length === 0 ? featuredPlayers : lastPlayers)"
          :key="player.id"
          :to="playerToRoute(player)"
          class="no-underline ml-2 text-secondary border-primary border-b-2">
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
      ></blogroll>
    </div>
  </div>
</template>

<script>
import Blogroll from '~/components/blogroll'
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

function playerToRoute(player) {
  return {
    name: 'player-name',
    params: {
      name: player.id,
    }
  }
}

export default {
  components: {
    Blogroll,
  },
  data() {
    return {
      name: undefined,
      nameLoading: false,
      nameNotFound: false,
      loadNameHelpVideo: false,
      playerToRoute,
    }
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentEvents')
    }
  },
  computed: {
    playerRoute() {
      return playerToRoute({ id: this.name })
    },
    nameRegex() {
      return new RegExp('#?[0289PYLQGRJCUV]{3,}')
    },
    randomHero() {
      const heroes = ['crow1_optimized', 'crow2_optimized', 'crow3_optimized']
      const hero = heroes[Math.floor(Math.random() * heroes.length)]
      return `/images/hero/model/${hero}.png`
    },
    ...mapState({
      lastPlayers: state => state.lastPlayers,
      featuredPlayers: state => state.featuredPlayers,
    }),
    ...mapGetters({
      relevantGuides: 'guidesForCurrentEvents',
    }),
  },
  methods: {
    async submitName() {
      this.nameNotFound = false

      if (!this.nameRegex.test(this.name)) {
        this.nameNotFound = true
        return
      }

      try {
        this.nameLoading = true
        this.setPlayerId({
          id: this.name,
        })
        await this.loadPlayer()
      } catch (error) {
        this.nameNotFound = true
        return
      } finally {
        this.nameLoading = false
      }

      this.$router.push(this.playerRoute)
    },
    ...mapMutations({
      setPlayerId: 'setPlayerId',
    }),
    ...mapActions({
      loadPlayer: 'loadPlayer',
    }),
  },
}
</script>
