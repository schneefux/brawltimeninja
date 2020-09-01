<template>
  <div class="page container">
    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9429125351"
        data-ad-format="auto"
        data-full-width-responsive
      />
      <div style="height: 300px;" class="adswrapper ad-section w-full" slot="placeholder"></div>
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'hours'),
        once: true,
      }"
    >
      <media-img
        v-if="Object.keys(player.brawlers).length > 0"
        :path="'/brawlers/' + topBrawlerId + '/model'"
        clazz="absolute w-1/3 md:w-1/6 mr-2 md:mr-10 right-0 z-0 opacity-25"
      ></media-img>
      <h1 class="text-4xl font-semibold relative z-10">
        Statistics for
        <span class="text-secondary">{{ player.name }}</span>
        <span
          v-if="player.tag == 'V8LLPPC'"
          class="align-top text-xs text-secondary-dark border-2 border-secondary-dark rounded-lg px-1 font-black"
        >DEV</span>
      </h1>
    </div>

    <div class="section leading-tight text-center">
      <player-hype-stats
        :player="player"
      ></player-hype-stats>
    </div>

    <client-only>
      <adsense
        v-if="!isApp && testGroup != 'player-only-top-ad'"
        :ins-style="testGroup == 'player-small-ads' ? 'display: block; max-height: 100px; height: 100%;' : 'display: block'"
        :data-ad-format="testGroup == 'player-small-ads' ? 'horizontal' : 'auto'"
        data-full-width-responsive="false"
        ins-class="w-screen md:w-full -mx-4 ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3933066188"
      />
    </client-only>

    <div
      :class="{
        'hidden': $route.path == `/player/${player.tag}`,
        'sticky top-0 pt-28 -mt-28 z-20': true,
      }"
    >
      <nuxt-link
        class="button button--lg"
        :to="`/player/${player.tag}`"
      >
        Close
      </nuxt-link>
    </div>
    <nuxt-child
      :player="player"
      :current-events="currentEvents"
      :active-map-meta="activeMapMeta"
      :refresh-seconds-left="refreshSecondsLeft"
      @refresh="refreshPlayer"
    ></nuxt-child>

    <div class="section-heading flex items-center">
      <h2 class="text-2xl font-semibold">
        Info!
      </h2>
      <p class="text-xs ml-3">
        Play times are estimated and statistics are compared against other visitors.
        They are not official numbers.
        Win Rates are based on your last {{ totalBattles }} battles.
        <br />
        Check your profile daily to get the most accurate statistics.
      </p>
    </div>

    <div
      v-show="isInstallable && !installBannerDismissed"
      class="mt-10 w-full md:w-1/2 mx-auto text-center leading-tight"
    >
      <div class="relative py-3 px-6 bg-primary-darker rounded border-2 border-secondary-lighter">
        <button
          class="absolute top-0 right-0 mr-1 mt-1"
          @click="dismissInstall"
        >
          <svg class="h-6 w-6 fill-current" viewBox="0 0 20 20">
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
        <p>
          Install the App for instant access.
          Track your trophies easily. Light, fast and free.
        </p>
        <div class="mt-3">
          <button
            class="button button--md"
            @click="clickInstall"
          >
            <span class="mr-1">📥</span>
            Install
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="relevantGuides.length > 0"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'articles'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Guides from the Blog
      </h2>
    </div>

    <div
      v-if="relevantGuides.length > 0"
      class="section"
    >
      <blogroll
        :posts="relevantGuides"
        topic="guides"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { MapMetaMap } from '../../model/MetaEntry'
import { ActiveEvent } from '../../model/Brawlstars'
import { Post } from '../../model/Web'

export default Vue.extend({
  head() {
    const description = `Brawl Time for ${(<any>this).player.name}: ${Math.floor((<any>this).player.hoursSpent)} hours spent, ${(<any>this).player.trophies} Trophies. Track Brawl Stars stats, calculate your Win Rate and get Tips.`
    return {
      title: (<any>this).player.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      error: '',
      refreshSecondsLeft: 180,
      currentEvents: [] as ActiveEvent[],
      activeMapMeta: {} as MapMetaMap,
      guides: [] as Post[],
      additionalPlayerDataLoaded: false,
    }
  },
  computed: {
    relevantGuides(): Post[] {
      return this.guides.slice(0, 3)
    },
    topBrawlerId(): string {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    totalBattles(): number {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.picks
      }
      return this.player.battles.length
    },
    ...mapState({
      player: (state: any) => state.player,
      installBannerDismissed: (state: any) => state.installBannerDismissed as boolean,
      testGroup: (state: any) => state.testGroup as string,
      isApp: (state: any) => state.isApp as boolean,
    }),
    ...mapGetters({
      isInstallable: 'isInstallable',
    }),
  },
  async validate({ store, params }) {
    const { tag } = params
    const tagRegex = RegExp(store.state.tagPattern)

    if (!tagRegex.test(tag)) {
      return false
    }

    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await store.dispatch('loadPlayer', tag)
        return true
      } catch (error) {
        if (error.response !== undefined && error.response.status === 404) {
          return false
        }
        lastError = error
      }
    }

    throw lastError
  },
  created() {
    if (!this.additionalPlayerDataLoaded) {
      this.loadPlayerWinrates()
      this.loadPlayerHistory()
      this.additionalPlayerDataLoaded = true
    }
  },
  async asyncData({ $axios, $content }: any) {
    const [events, activeMapMeta, guides] = await Promise.all([
      $axios.$get('/api/events/active').catch(() => ({ active: [], upcoming: [] })),
      $axios.$get('/api/meta/map/events').catch(() => ({})),
      $content('guides').sortBy('createdAt', 'desc').fetch(),
    ])
    return {
      currentEvents: events.current,
      activeMapMeta,
      guides,
    }
  },
  methods: {
    dismissInstall() {
      this.$ga.event('app', 'dismiss', 'install_banner')
      this.clearInstallPrompt()
      this.dismissInstallBanner()
    },
    async clickInstall() {
      this.$ga.event('app', 'click', 'install_banner')
      await this.install()
    },
    trackScroll(visible, entry, section) {
      if (visible) {
        this.$ga.event('profile', 'scroll', section)
      }
    },
    ...mapMutations({
      dismissInstallBanner: 'dismissInstallBanner',
      clearInstallPrompt: 'clearInstallPrompt',
    }),
    ...mapActions({
      refreshPlayer: 'refreshPlayer',
      loadPlayerHistory: 'loadPlayerHistory',
      loadPlayerWinrates: 'loadPlayerWinrates',
      install: 'install',
    }),
  },
})
</script>
