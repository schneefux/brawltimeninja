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
              class="button button-lg flex-shrink-0 mr-3"
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
          What is my tag?
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
          @ready="$ga.event('player', 'play_video', 'search', { nonInteraction: true })"
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
          Recently searched:
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
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'best_brawlers'),
        once: true,
      }"
      class="home-section container"
    >
      <div class="home-section-heading-container">
        <div class="home-section-heading-left">
          Best Brawlers
        </div>
        <div class="home-section-heading-right">
          <nuxt-link
            to="/meta/brawler"
            class="link"
          >
            Explore the Brawler Meta
          </nuxt-link>
        </div>
      </div>

      <div class="home-section-content">
        <template v-for="(brawler, prop) in topBrawlers">
          <div
            :key="prop"
            class="card-wrapper px-2"
          >
            <div class="card prop-card md:prop-card-lg">
              <span class="prop-card-title md:prop-card-title-lg">
                {{ brawler.name.toLowerCase() }}
              </span>
              <img
                :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
                class="prop-card-image md:prop-card-image-lg"
              >
              <div class="prop-card-content">
                <div>
                  <img
                    v-if="metaStatMaps.icons[prop].length > 2"
                    :src="require(`~/assets/images/icon/${metaStatMaps.icons[prop]}_optimized.png`)"
                    class="card-prop-icon inline"
                  >
                  <!-- use emojis (length 2) -->
                  <span
                    v-else
                    class="card-prop-icon"
                  >
                    {{ metaStatMaps.icons[prop] }}
                  </span>
                  <span class="card-prop-value">
                    {{ metaStatMaps.formatters[prop](brawler.stats[prop]) }}
                  </span>
                </div>
                <span class="text-xs md:text-sm">
                  {{ metaStatMaps.labels[prop] }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="currentEvents.length > 0"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'live_events'),
        once: true,
      }"
      class="home-section container"
    >
      <div class="home-section-heading-container">
        <div class="home-section-heading-left">
          Live Events
        </div>
        <div class="home-section-heading-right">
          <nuxt-link
            to="/meta/map"
            class="link"
          >
            Explore the Map Meta
          </nuxt-link>
        </div>
      </div>

      <div class="home-section-content">
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

      <div
        v-if="notificationsAllowed"
        class="mt-4 w-full mx-auto max-w-xl"
      >
        <div class="mx-5">
          <button
            class="mt-1 button button-sm"
            @click="notifyCurrentEventMeta"
          >
            Send a Notification with Map Meta
          </button>
        </div>
      </div>
    </div>

    <adsense
      v-if="ads"
      root-class="home-section container flex justify-center"
      ins-class="w-full mx-4 h-48"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="6736366415"
    />

    <div
      v-if="bsuArticles.length > 0 && !isApp"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'news_feed'),
        once: true,
      }"
      class="home-section container"
    >
      <div class="home-section-heading-container">
        <div class="home-section-heading-left">
          News from Brawl Stars UP!
        </div>
        <div class="home-section-heading-right">
          <a
            href="https://brawlstarsup.com/"
            class="link"
            target="_blank"
            rel="noopener nofollow"
            @click="$ga.event('home', 'bsu', 'click_visit')"
          >
            Visit BSU
          </a>
        </div>
      </div>

      <div class="home-section-content">
        <div
          v-for="article in bsuArticles"
          :key="article.link"
          class="link-card flex flex-col"
        >
          <a
            :href="article.link"
            class="w-64"
            target="_blank"
            rel="noopener nofollow"
            @click="$ga.event('home', 'bsu', 'click_article')"
          >
            <p class="link-light mt-4 text-center text-xl">
              {{ article.title }}
            </p>
            <p class="mt-4 text-black">
              {{ article.contentSnippet }}…
              <span class="link-light">
                Read more
              </span>
            </p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import { metaStatMaps } from '~/store/index'
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
      title: 'Brawl Stars Statistics',
    }
  },
  data() {
    return {
      notificationsAllowed: false,
      tag: undefined,
      loading: false,
      error: undefined,
      invalidTagAttempts: 0,
      loadHelpVideo: false,
      playerToRoute,
      metaStatMaps,
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
      ads: state => state.adsEnabled,
      player: state => state.player,
      tagPattern: state => state.tagPattern,
      lastPlayers: state => state.lastPlayers,
      featuredPlayers: state => state.featuredPlayers,
      currentEvents: state => state.currentEvents,
      bsuArticles: state => state.bsuArticles,
      isApp: state => state.isApp,
    }),
    ...mapGetters({
      topBrawlers: 'topBrawlers',
      bestBrawlersByMap: 'bestBrawlersByMap',
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentMeta')
      await store.dispatch('loadBrawlerMeta')
      await store.dispatch('loadBsuArticles')
    }
  },
  created() {
    if (process.static) {
      this.loadCurrentMeta()
      this.loadBrawlerMeta()
      this.loadBsuArticles()
    }

    if (process.client) {
      this.notificationsAllowed = Notification.permission !== 'denied'
    }
  },
  methods: {
    async notifyCurrentEventMeta() {
      if (!(Notification.permission in ['denied', 'granted'])) {
        await Notification.requestPermission()
      }

      if (Notification.permission === 'granted') {
        this.$ga.event('home', 'send_notification', 'meta')
        this.notificationsAllowed = true

        const sw = await navigator.serviceWorker.ready

        await Promise.all(this.currentEvents.map(async (event) => {
          const logAndNull = (e) => {
            this.$ga.exception('cannot load image: ' + e.message)
            console.log('cannot load image', e.message)
            return {}
          }
          const modeId = event.mode.replace(' ', '').toLowerCase().replace('soloshowdown', 'showdown')
          const badge = await import(`~/assets/images/mode/icon/${modeId}_optimized.png`).catch(logAndNull)
          const icon = await import(`~/assets/images/map/${event.id.replace(/^1500/, '150')}_small.jpg`).catch(logAndNull)

          const top5 = this.bestBrawlersByMap[event.id].slice(0, 5).map(brawler => brawler.name)

          sw.showNotification(`${event.mode}: ${top5.join(', ')}`, {
            tag: event.id,
            body: `Best Brawlers for ${event.mode}: ${event.map} as recommended by Brawl Time Ninja`,
            badge: badge.default,
            icon: icon.default,
          })
        }))
      } else {
        this.notificationsAllowed = false
      }
    },
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
        await this.loadPlayer(this.cleanedTag)
        this.addLastPlayer(this.player)
      } catch (error) {
        if (error.response !== undefined && error.response.status === 404) {
          this.$ga.event('player', 'search', 'error_notfound')
          this.error = 'This tag does not exist'
        } else if (error.response !== undefined && error.response.status === 429) {
          this.$ga.event('player', 'search', 'error_timeout')
          this.error = 'Could not communicate with the Brawlstars API, try again?'
        } else {
          this.$ga.exception('cannot get player: ' + error.message)
          this.$ga.event('player', 'search', 'error_api')
          this.error = 'Brawlstars API is not available right now, try again later'
        }
        return
      } finally {
        this.loading = false
      }

      this.$ga.event('player', 'search', 'success')
      this.$router.push(this.playerRoute)
    },
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$ga.event('home', 'scroll', section)
      }
    },
    ...mapMutations({
      addLastPlayer: 'addLastPlayer',
    }),
    ...mapActions({
      loadBrawlerMeta: 'loadBrawlerMeta',
      loadPlayer: 'loadPlayer',
      loadCurrentMeta: 'loadCurrentMeta',
      loadBsuArticles: 'loadBsuArticles',
    }),
  },
}
</script>

<style>
.placeholder\:normal-case::placeholder {
  @apply normal-case;
}

.home-section {
  @apply my-6;
}

.home-section-heading-container {
  @apply w-full max-w-xl mx-auto mb-1 relative;
}

.home-section-heading-left {
  @apply text-left text-lg ml-5;
}

.home-section-heading-right {
  @apply text-right text-sm absolute bottom-0 right-0 mr-5;
}

.home-section-content {
  @apply w-full flex flex-wrap justify-center;
}
</style>
