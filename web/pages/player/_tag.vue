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
        :total-brawlers="totalBrawlers"
        :hours-leaderboard="hoursLeaderboard"
        :enable-clicker-stats="enableClickerStats"
        :battle-totals="battleTotals"
      ></player-hype-stats>
    </div>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'quiz'),
        once: true,
      }"
      class="card-wrapper"
    >
      <player-quiz
        :player="player"
      ></player-quiz>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="false"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3933066188"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      title="Personal Records"
      description="Compare your profile statistics against pro players."
      class="card-wrapper"
    >
      <player-lifetime
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'lifetime'),
          once: true,
        }"
        :stats="player.stats"
        :tease="!props.open"
      ></player-lifetime>

      <template v-if="props.open">
        <h3
          v-observe-visibility="{
            callback: (v, e) => trackScroll(v, e, 'pro'),
            once: true,
          }"
          class="card__header mt-3"
        >
          Are you a Pro?
        </h3>

        <player-percentiles
          :player="player"
          class="card__text"
        ></player-percentiles>
      </template>
    </player-teaser-card>

    <div class="card-wrapper">
      <div class="mx-1 md:m-6 flex items-center">
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
    </div>

    <player-teaser-card
      v-if="player.battles.length > 0"
      v-slot="props"
      :pages="Math.ceil(player.battles.length / 6)"
      title="Battle Log"
      description="See your latest battles and calculate your Win Rate."
      class="card-wrapper"
    >
      <player-battles-squares
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'battles'),
          once: true,
        }"
        :battles="player.battles"
        :tease="!props.open"
      ></player-battles-squares>

      <template v-if="props.open">
        <div class="w-full md:w-auto md:ml-auto mt-2 flex items-center">
          <span class="text-sm text-grey-lighter">
            Updating again in {{ Math.floor(refreshSecondsLeft / 60) }}m {{ refreshSecondsLeft % 60 }}s
          </span>
          <button
            class="ml-auto md:ml-4 button button--sm button--secondary"
            @click="refresh"
          >
            Refresh now
          </button>
        </div>

        <player-battles-stats
          :battle-totals="battleTotals"
          :battles="player.battles"
        ></player-battles-stats>

        <player-battles
          :player="player"
          :limit="props.page * 6"
        ></player-battles>
      </template>
    </player-teaser-card>

    <div
      v-show="isInstallable && !installBannerDismissed"
      class="card-wrapper md:w-1/2 mx-auto text-center leading-tight"
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
          Add the web app to your home screen.
          Track your trophies easily. Light, fast and free.
        </p>
        <div class="mt-3">
          <button
            class="button button--md button--secondary"
            @click="clickInstall"
          >
            <span class="mr-1">📥</span>
            Install
          </button>
        </div>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp && player.battles.length > 0"
        data-ad-format="auto"
        data-full-width-responsive="false"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        id="ezoic-pub-ad-placeholder-102"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      title="Game Modes"
      description="View your win rate in different modes and get personalized recommendations."
      class="card-wrapper"
    >
      <player-mode-winrates
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gamemodes'),
          once: true,
        }"
        :player="player"
        :battles="player.battles"
        :active-map-meta="activeMapMeta"
        :tease="!props.open"
        :enable-clicker-stats="enableClickerStats"
      ></player-mode-winrates>

      <template v-if="props.open">
        <div class="mt-1 w-full flex justify-end">
          <player-tips
            :player="player"
            :active-map-meta="activeMapMeta"
            class="mr-3 button md:button--md"
          ></player-tips>

          <nuxt-link
            class="button md:button--md button--secondary"
            to="/tier-list/map"
          >
            Open Map Tier List
          </nuxt-link>
        </div>
      </template>
    </player-teaser-card>

    <client-only>
      <adsense
        v-if="!isApp"
        data-ad-format="auto"
        data-full-width-responsive="false"
        ins-class="w-screen -mx-4 md:w-full ad-section mb-4"
        id="ezoic-pub-ad-placeholder-101"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </client-only>

    <player-teaser-card
      v-slot="props"
      :pages="Math.ceil(Object.keys(player.brawlers).length) / 15"
      title="Brawlers"
      description="View Trophy Graphs and Win Rates for all of your Brawlers."
      class="card-wrapper"
    >
      <player-brawlers
        :player="player"
        :tease="!props.open"
        :limit="props.page * 15"
        :enable-clicker-stats="enableClickerStats"
      ></player-brawlers>
    </player-teaser-card>

    <div
      v-if="relevantGuides.length > 0"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'articles'),
        once: true,
      }"
      class="w-full section-heading"
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
import { Post } from '../../model/Web'
import { ActiveEvent, CurrentAndUpcomingEvents, Leaderboard, LeaderboardEntry } from '../../model/Api'
import { NuxtAxiosInstance } from '@nuxtjs/axios'
import { BattleTotalRow } from '../../components/player-battles-stats.vue'

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
      refreshSecondsLeft: 180,
      activeMapMeta: {} as MapMetaMap,
      guides: [] as Post[],
      hoursLeaderboard: [] as LeaderboardEntry[],
      battleTotals: {} as BattleTotalRow,
    }
  },
  computed: {
    relevantGuides(): Post[] {
      return this.guides.slice(0, 3)
    },
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    enableClickerStats(): boolean {
      // do not send queries to backend if user has no battle history in database
      return this.battleTotals.picks != undefined && this.battleTotals.picks > 25
    },
    topBrawlerId(): string {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    ...mapState({
      player: (state: any) => state.player,
      totalBrawlers: (state: any) => state.totalBrawlers,
      installBannerDismissed: (state: any) => state.installBannerDismissed as boolean,
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
  mounted() {
    setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  async asyncData(context) {
    const $axios = context.$axios
    const $content = (<any>context).$content

    const [guides, activeMapMeta, hoursLeaderboard] = await Promise.all([
      $content('guides').sortBy('createdAt', 'desc').fetch(),
      $axios.$get<MapMetaMap>('/api/meta/map/events').catch(() => ({})),
      $axios.$get<Leaderboard>('/api/leaderboard/hours').catch(() => ({ metric: 'hours', entries: [] })),
    ])

    return {
      guides: guides as Post[],
      hoursLeaderboard: (<Leaderboard>hoursLeaderboard).entries as LeaderboardEntry[],
      activeMapMeta,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const battleData = await this.$clicker.query('player.winrates.total',
      'battle',
      [],
      ['picks', 'battle_victory', 'battle_trophy_change'],
      {
        ...this.$clicker.defaultSlices('battle'),
        player_tag: [this.player.tag],
      },
      { sort: { picks: 'desc' }, cache: 60 })

    if (battleData.data[0].picks != undefined) {
      this.battleTotals = battleData.data[0]
    }
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
        await this.$fetch()
      }
      setTimeout(() => this.refreshTimer(), 15 * 1000)
    },
    async refresh() {
      this.refreshSecondsLeft = 180
      await this.refreshPlayer()
    },
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
      install: 'install',
    }),
  },
})
</script>
