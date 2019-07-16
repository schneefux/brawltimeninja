<template>
  <div class="flex flex-col items-center">
    <img
      :src="randomHero"
      class="mt-16 lg:mt-12vh h-32 md:h-48 lg:h-64"
    >

    <div class="mt-10 lg:mt-8vh text-center mx-2">
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
        :action="`/player/${cleanedTag}`"
        :target="isInIframe ? '_parent' : ''"
        :onSubmit="isInIframe ? '' : 'return false;'"
        @submit="search"
      >
        <div class="w-full flex justify-center">
          <div class="mt-3 py-2 border-2 rounded-lg border-primary-dark">
            <input
              v-model="tag"
              placeholder="Enter your Tag"
              type="text"
              autocomplete="off"
              class="w-40 md:w-48 tracking-wider uppercase placeholder:normal-case font-semibold appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2"
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
        <youtube
          v-if="loadHelpVideo"
          ref="helpVideo"
          class="mt-3 max-w-full"
          width="480"
          height="271"
          video-id="LuUmyorhSIQ"
          autoplay
          mute
          @ready="$ga.event('player', 'search', 'play_video')"
          @ended="$refs.helpVideo.player.playVideo()"
        />
      </details>
    </div>

    <div class="my-4 text-center max-w-sm">
      <p class="text-grey">
        <span v-if="lastPlayers.length === 0">
          Or check one of these profiles:
        </span>
        <span v-if="lastPlayers.length > 0">
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
      v-if="Object.keys(topBrawlers).length > 0"
      class="mt-4 lg:mt-6 mb-6 container flex flex-wrap justify-center"
    >
      <div class="w-full max-w-xl">
        <div class="mx-5 mb-1 relative">
          <div class="w-2/3 text-left text-lg">
            Best Brawlers right now
          </div>
          <div class="w-1/3 text-right text-sm absolute bottom-0 right-0">
            <nuxt-link
              to="/meta/brawler"
              class="link"
            >
              Explore the Brawler Meta
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="w-full flex flex-wrap justify-center">
        <template v-for="(brawler, prop) in topBrawlers">
          <div
            :key="prop"
            class="card-wrapper px-2"
          >
            <div
              class="card h-14 md:h-24 border-primary-darker border-2 flex justify-between mx-auto"
            >
              <div class="w-16 md:w-24 relative">
                <span class="z-10 absolute ml-1 md:mt-1 md:ml-2 font-semibold md:text-lg text-white text-shadow whitespace-no-wrap">
                  {{ brawler.name }}
                </span>
                <img
                  :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
                  class="z-0 absolute bottom-0 h-12 md:h-16"
                >
              </div>
              <div class="w-24 md:w-32 py-1 pr-1 md:py-2 md:pr-2 my-auto text-center relative">
                <div>
                  <img
                    :src="require(`~/assets/images/icon/${metaStatMaps.icons[prop]}_optimized.png`)"
                    class="card-prop-icon inline"
                  >
                  <span class="card-prop-value">{{ metaStatMaps.formatters[prop](brawler[prop]) }}</span>
                </div>
                <span class="text-xs md:text-sm">{{ metaStatMaps.labels[prop] }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div
      class="mt-6 mb-6 container"
    >
      <div class="mx-auto max-w-xl">
        <div class="mx-5 mb-1 relative">
          <div class="w-2/3 text-left text-lg">
            Events
          </div>
          <div class="w-1/3 text-right text-sm absolute bottom-0 right-0">
            <nuxt-link
              to="/meta/map"
              class="link"
            >
              Explore all
            </nuxt-link>
          </div>
        </div>
      </div>

      <div class="w-full flex flex-wrap justify-center">
        <div
          v-for="event in currentEvents"
          :key="event.id"
          class="w-80"
        >
          <event-card
            :event="event"
            class="rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import EventCard from '~/components/event-card'
import Youtube from '~/components/youtube'

function playerToRoute(player) {
  return {
    name: 'player-tag',
    params: {
      tag: player.tag,
    },
  }
}

export default {
  components: {
    EventCard,
    Youtube,
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
    isInIframe() {
      try {
        return global.window === undefined || global.window.self !== global.window.top
      } catch (e) {
        return true
      }
    },
    ...mapState({
      tagPattern: state => state.tagPattern,
      lastPlayers: state => state.lastPlayers,
      featuredPlayers: state => state.featuredPlayers,
      currentEvents: state => state.currentEvents,
    }),
    ...mapGetters({
      topBrawlers: 'topBrawlers',
      metaStatMaps: 'metaStatMaps',
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentEvents')
      await store.dispatch('loadBrawlerMeta')
    }
  },
  mounted() {
    if (process.static) {
      this.loadCurrentEvents()
      this.loadBrawlerMeta()
    }
  },
  methods: {
    async search() {
      this.error = undefined

      if (!this.tagRegex.test(this.cleanedTag)) {
        this.$ga.event('player', 'search', 'error_invalid')
        this.error = 'This is not a tag'

        this.invalidTagAttempts++
        if (this.invalidTagAttempts === 1) {
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
        if (error.response !== undefined && error.response.status === 404) {
          this.$ga.event('player', 'search', 'error_notfound')
          this.error = 'This tag does not exist'
        } else if (error.response !== undefined && error.response.status === 429) {
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
      loadBrawlerMeta: 'loadBrawlerMeta',
      loadPlayer: 'loadPlayer',
      loadCurrentEvents: 'loadCurrentEvents',
    }),
  },
}
</script>

<style>
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}

@responsive {
  .mt-8vh {
    margin-top: 8vh;
  }
}

@responsive {
  .mt-12vh {
    margin-top: 12vh;
  }
}
</style>
