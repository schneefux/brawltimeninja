<template>
  <div class="flex flex-col items-center">
    <media-img
      :path="randomHero"
      clazz="mt-16 lg:mt-12vh h-32 md:h-48 lg:h-64"
    ></media-img>

    <div class="mt-10 lg:mt-8vh text-center mx-2">
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
              class="button button-lg flex-shrink-0 mr-3"
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
        ref="helpDropdown"
        class="mx-6"
      >
        <summary>
          What is my tag?
        </summary>
        <img
          src="~/assets/images/tag-help.jpg"
          class="mt-3 w-120 max-w-full"
        >
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
        v-if="!isApp && testGroup != 'player-only-top-ad'"
        :ins-style="testGroup == 'player-small-ads' ? 'display: block; max-height: 100px; height: 100%;' : 'display: block'"
        :data-ad-format="testGroup == 'player-small-ads' ? 'horizontal' : 'auto'"
        data-full-width-responsive="false"
        class="container flex justify-center"
        ins-class="w-screen md:w-full -mx-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6067985913"
      />
    </client-only>

    <div
      v-show="Object.keys(topBrawlers).length > 0"
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
        <template v-for="(brawler, prop) in topBrawlers">
          <div
            :key="prop"
            class="card-wrapper px-2"
            itemscope
            itemtype="http://schema.org/Person"
          >
            <div class="card prop-card md:prop-card-lg">
              <span class="prop-card-title md:prop-card-title-lg" itemprop="name">
                {{ brawler.name.toLowerCase() }}
              </span>
              <media-img
                :path="'/brawlers/' + brawler.id + '/avatar'"
                :alt="brawler.name"
                size="128"
                clazz="prop-card-image md:prop-card-image-lg"
                itemprop="image"
              ></media-img>
              <div
                class="prop-card-content"
                itemscope
                itemtype="http://schema.org/QuantitativeValue"
              >
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
                  <span class="card-prop-value" itemprop="value">
                    {{ metaStatMaps.formatters[prop](brawler.stats[prop]) }}
                  </span>
                </div>
                <span class="text-xs md:text-sm" itemprop="unitText">
                  {{ metaStatMaps.labels[prop] }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp && testGroup != 'player-only-top-ad'"
        :ins-style="testGroup == 'player-small-ads' ? 'display: block; max-height: 100px; height: 100%;' : 'display: block'"
        :data-ad-format="testGroup == 'player-small-ads' ? 'horizontal' : 'auto'"
        data-full-width-responsive="false"
        class="container flex justify-center"
        ins-class="w-screen md:w-full -mx-4"
        id="ezoic-pub-ad-placeholder-104"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6709232983"
      />
    </client-only>

    <div
      v-show="currentEvents.length > 0"
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
        <lazy
          v-for="event in currentEvents"
          :key="event.id"
          distance="320px"
        >
          <div style="height: 320px; width: 320px" slot="placeholder"></div>
          <event-card
            :mode="event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')"
            :map="event.map"
            :id="event.id"
            infobar
            actions
          >
            <template v-slot:infobar>
              <p class="text-right">
                ends in {{ relativeTimeUntil(event.end) }}
              </p>
            </template>
            <template v-slot:content>
              <div class="brawler-avatars my-4">
                <div
                  v-for="brawler in (bestByEvent[event.id] || []).slice(0, 5)"
                  :key="brawler.id"
                  class="brawler-avatars__element"
                >
                  <div class="brawler-avatar">
                    <media-img
                      :path="`/brawlers/${brawler.id}/avatar`"
                      size="160"
                      clazz="brawler-avatar__img"
                    />
                    <p class="brawler-avatar__stats">
                      {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
                      {{ metaStatMaps.labelsShort[brawler.sortProp] }}
                    </p>
                  </div>
                </div>
              </div>
            </template>
            <template v-slot:actions>
              <div class="flex justify-end">
                <nuxt-link
                  :to="`/tier-list/map/${event.id}`"
                  class="button button-md"
                >
                  Open
                </nuxt-link>
              </div>
            </template>
          </event-card>
        </lazy>
      </div>

      <div
        v-show="notificationsAllowed"
        class="mt-4 w-full mx-auto max-w-xl"
      >
        <div class="mx-5">
          <button
            class="mt-1 button button-sm"
            @click="notifyCurrentEventMeta"
          >
            Send a Notification with Map Tier List
          </button>
        </div>
      </div>
    </div>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-103"
        class="home-section container flex justify-center"
        ins-class="w-full"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6736366415"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      v-show="bsuArticles.length > 0 && !isApp"
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
            rel="noopener nofollow sponsored"
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
            rel="noopener nofollow sponsored"
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

<script lang="ts">
import Vue from 'vue'
import { mapState, mapMutations, mapActions } from 'vuex'
import { metaStatMaps, relativeTimeUntil, MetaGridEntrySorted, formatAsJsonLd, getBest, getBestBrawlersByEachMetric } from '../lib/util'
import { ActiveEvent } from '../model/Brawlstars'
import { MapMetaMap } from '../model/MetaEntry'
import { BrawlerMetaStatistics } from '../model/Api'

function playerToRoute(player) {
  return {
    name: 'player-tag',
    params: {
      tag: player.tag,
    },
  }
}

export default Vue.extend({
  head() {
    const description = 'Track Brawl Stars stats. Calculate your win rate, how many hours you play and other statistics. View Tier Lists for current events and get gameplay tips.'
    const currentEvents = this.currentEvents as ActiveEvent[]
    const structuredData = currentEvents
      .map((event) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(formatAsJsonLd(event)),
      }))

    return {
      title: 'Brawl Stars Stats',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: structuredData,
    }
  },
  data() {
    return {
      notificationsAllowed: false,
      tag: undefined as string|undefined,
      loading: false,
      error: undefined as string|undefined,
      invalidTagAttempts: 0,
      currentEvents: [] as ActiveEvent[],
      bestByEvent: {} as { [key: string]: MetaGridEntrySorted[] },
      topBrawlers: {} as { [key: string]: BrawlerMetaStatistics },
      bsuArticles: [] as { title: string, link: string, contentSnippet: string }[],
      playerToRoute,
      metaStatMaps,
      relativeTimeUntil,
    }
  },
  computed: {
    playerRoute() {
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
    randomPlayers() {
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
    ...mapState({
      player: (state: any) => state.player,
      tagPattern: (state: any) => state.tagPattern as string,
      lastPlayers: (state: any) => state.lastPlayers,
      featuredPlayers: (state: any) => state.featuredPlayers,
      testGroup: (state: any) => state.testGroup as string,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ $axios }) {
    const events = await $axios.$get('/api/events/active').catch(() => ({ active: [], upcoming: [] })) as { current: ActiveEvent[], upcoming: ActiveEvent[] }
    const mapMeta = await $axios.$get('/api/meta/map/events').catch(() => ({})) as MapMetaMap
    const brawlerMeta = await $axios.$get('/api/meta/brawler').catch(() => ([])) as BrawlerMetaStatistics[]
    const bsuArticles = await $axios.$get('/api/partners/bsu').catch(() => []) as { title: string, link: string, contentSnippet: string }[]
    const bestByEvent = getBest(mapMeta)
    const topBrawlers = getBestBrawlersByEachMetric(brawlerMeta)
    return {
      currentEvents: events.current,
      bestByEvent,
      topBrawlers,
      bsuArticles,
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

        await Promise.all(this.currentEvents.map(async (event) => {
          const logAndNull = (e) => {
            this.$ga.exception('cannot load image: ' + e.message)
            console.log('cannot load image', e.message)
            return {}
          }
          const modeId = event.mode.replace(' ', '').toLowerCase().replace('soloshowdown', 'showdown')
          const badge = await import(`~/assets/images/mode/icon/${modeId}_optimized.png`).catch(logAndNull)
          const icon = await import(`~/assets/images/map/${event.id.replace(/^1500/, '150')}_small.jpg`).catch(logAndNull)

          const top5 = (this.bestByEvent[event.id] || []).slice(0, 5).map(entry => entry.title)

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
          this.$refs.helpDropdown.setAttribute('open', '')
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
      this.$router.push(this.playerRoute)
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
      loadBsuArticles: 'loadBsuArticles',
    }),
  },
})
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
