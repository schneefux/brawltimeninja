<template>
  <div class="flex flex-col items-center">
    <quick-tip
      v-if="showQuickTip"
      :player-tag="userTag || lastPlayers[0].tag"
      @close="closeQuickTip"
      class="mx-auto px-4 mt-4 max-w-2xl"
    ></quick-tip>
    <media-img
      :path="randomHero"
      size="500"
      :clazz="{
        'mx-auto': true,
        'hidden md:mt-12 md:block md:h-32 lg:h-48': showQuickTip,
        'mt-16 h-32 md:h-48 lg:h-64': !showQuickTip,
      }"
    ></media-img>

    <div class="mt-6 md:mt-10 text-center mx-2">
      <h1 class="text-4xl font-bold">
        How much time on Brawl Stars?
      </h1>
    </div>

    <p class="mt-3 text-center text-lg mx-2">
      See how much you play, statistics for your Brawlers and more.
    </p>

    <div class="mt-4 mx-4"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'search'),
        once: true,
      }"
    >
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
              class="button button--lg button--secondary flex-shrink-0 mr-3"
              value="Search"
            >
          </div>
        </div>
        <p
          v-show="loading"
          class="mt-2 text-red-lighter"
        >
          Searching…
        </p>
        <p
          v-show="error"
          class="mt-2 text-red-lighter"
        >
          {{ error }}
        </p>
      </form>
    </div>

    <div class="mt-3 text-center">
      <details
        ref="help-dropdown"
        class="mx-6"
      >
        <summary>
          What is my tag?
        </summary>
        <div class="mt-2 card card--dark card__content">
          <h2 class="card__header">How to find your tag</h2>
          <p class="mt-2">Open the game.</p>
          <p class="mt-1">Tap on your profile icon.</p>
          <img
            loading="lazy"
            src="~/assets/images/tag/tag-1.jpg"
            class="px-8 mt-1 w-80 max-w-full"
          >
          <p class="mt-3">The string starting with "#" is your tag.</p>
          <img
            loading="lazy"
            src="~/assets/images/tag/tag-2.jpg"
            class="px-8 mt-1 w-80 max-w-full"
          >
        </div>
      </details>
    </div>

    <div class="my-4 text-center max-w-sm">
      <p class="text-grey">
        <span v-show="lastPlayers.length === 0">
          Or check one of these profiles:
        </span>
        <span v-show="lastPlayers.length > 0">
          Recently searched:
        </span>
      </p>
      <p class="mt-2 mx-auto">
        <nuxt-link
          v-for="player in (lastPlayers.length === 0 ? randomPlayers : lastPlayers)"
          :key="player.tag"
          :to="playerToRoute(player)"
          @click.native.passive="addLastPlayer(player)"
          class="ml-2 link"
        >
          {{ player.name }}
        </nuxt-link>
      </p>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        class="container flex justify-center"
        ins-class="w-screen md:w-full -mx-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6067985913"
      />
    </client-only>

    <div
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
            to="/tier-list/brawler"
            class="link"
          >
            Explore the Brawler Tier List
          </nuxt-link>
        </div>
      </div>

      <div class="home-section-content">
        <top-brawlers></top-brawlers>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="no"
        class="container flex justify-center"
        ins-class="w-screen md:w-full -mx-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6709232983"
      />
    </client-only>

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
          Brawl Stars Events
        </div>
      </div>

      <div class="home-section-content">
        <active-events></active-events>
      </div>

      <div
        v-show="notificationsAllowed"
        class="mt-4 w-full mx-auto max-w-xl"
      >
        <div class="mx-5">
          <button
            class="mt-1 button button--sm button--secondary"
            @click="notifyCurrentEventMeta"
          >
            Send a Notification with Map Tier List
          </button>
        </div>
      </div>
    </div>

    <client-only>
      <adsense
        class="home-section container flex justify-center"
        ins-class="w-full"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6736366415"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { formatAsJsonLd, getBest, unformatMode } from '../lib/util'
import { Player } from '../model/Brawlstars'
import { MapMetaMap } from '../model/MetaEntry'
import { BrawlerMetaStatistics, ActiveEvent, CurrentAndUpcomingEvents } from '../model/Api'

function playerToRoute(player) {
  return {
    name: 'player-tag',
    params: {
      tag: player.tag,
    },
  }
}

export default Vue.extend({
  head(): MetaInfo {
    const description = 'Track Brawl Stars stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.'
    const structuredData = this.currentEvents
      .map((event) => ({
        type: 'application/ld+json',
        json: formatAsJsonLd(event),
      }))

    return {
      title: 'Brawl Stars Stats',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      script: structuredData,
    }
  },
  data() {
    return {
      closedQuickTip: false,
      notificationsAllowed: false,
      tag: undefined as string|undefined,
      loading: false,
      error: undefined as string|undefined,
      currentEvents: [] as ActiveEvent[],
      playerToRoute,
      unformatMode,
    }
  },
  computed: {
    playerRoute(): any {
      return playerToRoute({
        tag: this.cleanedTag,
      })
    },
    tagRegex(): RegExp {
      return new RegExp(this.tagPattern)
    },
    cleanedTag(): string {
      return (this.tag || '')
        .trim()
        .replace('#', '')
        .toUpperCase()
        .replace(/O/g, '0')
    },
    randomHero(): string {
      const heroes = ['crow1', 'crow2', 'crow3']
      const hero = heroes[Math.floor(Math.random() * heroes.length)]
      return '/brawlers/' + hero + '/model';
    },
    randomPlayers(): string[] {
      const players = this.featuredPlayers.concat().sort(() => 0.5 - Math.random())
      return players.slice(0, 3)
    },
    isInIframe(): boolean {
      try {
        return (<any>global).window === undefined || (<any>global).window.self !== (<any>global).window.top
      } catch (e) {
        return true
      }
    },
    showQuickTip(): boolean {
      return this.testGroup == 'quicktip' && (this.userTag != undefined || this.lastPlayers.length > 0) && this.closedQuickTip == false && this.loading == false
    },
    ...mapState({
      player: (state: any) => state.player as Player,
      userTag: (state: any) => state.userTag as undefined|string,
      tagPattern: (state: any) => state.tagPattern as string,
      lastPlayers: (state: any) => state.lastPlayers,
      featuredPlayers: (state: any) => state.featuredPlayers,
      isApp: (state: any) => state.isApp as boolean,
      testGroup: (state: any) => state.testGroup as string,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
    }),
  },
  async asyncData({ $axios }) {
    const events = await $axios.$get<CurrentAndUpcomingEvents>('/api/events/active')
      .catch(() => ({ current: [], upcoming: [] }))
    return {
      currentEvents: events.current,
    }
  },
  created() {
    if ((<any>process).client && 'Notification' in window) {
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

        const mapMeta = await this.$axios.$get('/api/meta/map/events').catch(() => ({})) as MapMetaMap
        const bestByEvent = getBest(mapMeta)

        await Promise.all(this.currentEvents.map(async (event) => {
          const logAndNull = (e) => {
            this.$ga.exception('cannot load image: ' + e.message)
            console.log('cannot load image', e.message)
            return {}
          }
          const modeId = event.mode.replace(' ', '').toLowerCase().replace('soloshowdown', 'showdown')
          const badge = await import(`~/assets/images/mode/icon/${modeId}_optimized.png`).catch(logAndNull)
          const icon = await import(`~/assets/images/map/${event.id.replace(/^1500/, '150')}_small.jpg`).catch(logAndNull)

          const top5 = (bestByEvent[event.id] || []).slice(0, 5).map(entry => entry.title)

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
        const dropdown = this.$refs['help-dropdown'] as HTMLElement
        dropdown.setAttribute('open', '')
        // key events would cancel scroll
        this.$scrollTo(dropdown, 1000, { cancelable: false, offset: -300 })
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
          this.error = 'Could not communicate with the Brawl Stars API, try again?'
        } else {
          this.$ga.exception('cannot get player: ' + error.message)
          this.$ga.event('player', 'search', 'error_api')
          this.error = 'Brawl Stars API is not available right now, try again later'
        }
        return
      } finally {
        this.loading = false
      }

      this.$ga.event('player', 'search', 'success')
      if (this.cookiesAllowed) {
        document.cookie = `usertag=${this.cleanedTag}; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
      }
      this.$router.push(this.playerRoute)
    },
    closeQuickTip() {
      this.closedQuickTip = true
      this.$ga.event('home', 'close', 'quick-tip')
    },
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('home', 'scroll', section)
      }
    },
    ...mapMutations({
      addLastPlayer: 'addLastPlayer',
    }),
    ...mapActions({
      loadPlayer: 'loadPlayer',
    }),
  },
})
</script>

<style scoped lang="postcss">
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
