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
      <div class="section items-center justify-center flex flex-wrap">
        <div class="mx-auto md:mx-0 flex">
          <dl>
            <dd ref="counter-hours" class="text-5xl text-secondary font-bold">
              ...
            </dd>
            <dt class="text-3xl text-white">
              hours spent
            </dt>
          </dl>
          <nuxt-link
            v-if="rank !== 0"
            to="/leaderboard"
            class="text-4xl -ml-4 text-primary-light font-bold"
          >
            #{{ rank }}
          </nuxt-link>
        </div>

        <p class="hidden md:block w-full md:w-auto text-xl my-4 mx-auto">
          which is about
        </p>

        <dl class="hidden md:flex flex-wrap justify-between z-20">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto px-2 my-3"
          >
            <dd ref="counter-funstats" class="text-3xl text-secondary font-semibold">
              ...
            </dd>
            <dt class="text-2xl text-grey-lighter">
              {{ stat.label }}
            </dt>
          </div>
        </dl>
      </div>

      <div class="section bigstat-wrapper">
        <dl
          v-if="player.clubName !== undefined && player.clubName != ''"
          class="bigstat-container"
        >
          <div class="bigstat-left text-5vw md:text-4xl!">
            <div class="" style="margin-top: -0.125em">
              [
            </div>
            <dd class="mx-2 text-primary-light font-semibold text-center">
              {{ player.clubName.replace(/ /g, '&nbsp;') }}
            </dd>
            <div class="" style="margin-top: -0.125em">
              ]
            </div>
          </div>
          <dt class="bigstat-right bigstat-label text-4xl">
            Club
          </dt>
        </dl>

        <div class="bigstat-container">
          <dl class="flex flex-wrap">
            <dd class="bigstat-left bigstat-number">
              {{ player.trophies.toLocaleString() }}
            </dd>
            <dt class="bigstat-right bigstat-label text-4xl">
              Trophies
            </dt>
          </dl>

          <div class="w-full max-w-xs my-3 md:my-0 md:w-64 relative">
            <div class="h-24 md:h-20 flex flex-col justify-center">
              <client-only>
                <history-graph
                  v-if="player.history.length > 1"
                  :history="player.history"
                ></history-graph>
                <span v-else class="italic">
                  Come back later to see progress charts
                </span>
              </client-only>
            </div>
          </div>
        </div>

        <dl
          v-if="brawlersUnlocked < totalBrawlers"
          class="bigstat-container"
        >
          <dd class="bigstat-left bigstat-number">
            {{ Math.floor(trophiesGoal).toLocaleString() }}
          </dd>
          <div class="bigstat-right">
            <dt class="bigstat-label w-48 pt-1">
              <span class="text-xl">
                Potential&nbsp;Trophies
              </span>
              <span class="text-sm">
                (with&nbsp;all&nbsp;Brawlers&nbsp;unlocked)
              </span>
            </dt>
          </div>
        </dl>

        <dl class="bigstat-container" v-if="winRate !== 0">
          <div class="bigstat-left relative">
            <dd class="bigstat-number">
              {{ Math.floor(winRate * 100) }}%
            </dd>
            <button
              @click="recentHelpOpen = true"
              class="bigstat-tooltip-btn"
            >?</button>
            <p
              v-if="recentHelpOpen"
              @click="recentHelpOpen = false"
              class="bigstat-tooltip-text"
            >
              Your last {{ totalBattles }} battles are used for "Recent" statistics. <br>
              The Recent Win Rate takes 3v3 wins and Showdown rankings into account.
              <span class="bigstat-tooltip-close">x</span>
            </p>
          </div>
          <div class="bigstat-right bigstat-label text-xl">
            <dt class="w-24">
              Recent Win&nbsp;Rate
            </dt>
          </div>
        </dl>

        <dl class="bigstat-container" v-if="trophyRate !== 0">
          <dd class="bigstat-left bigstat-number">
            {{ trophyRate.toFixed(2) }}
          </dd>
          <div class="bigstat-right bigstat-label text-xl">
            <dt class="w-24">
              Recent&nbsp;Trophies per&nbsp;battle
            </dt>
          </div>
        </dl>

        <dl class="bigstat-container">
          <div class="bigstat-left relative">
            <dd class="bigstat-number">{{ accountRating }}</dd>
            <button
              @click="ratingHelpOpen = true"
              class="bigstat-tooltip-btn"
            >?</button>
            <p
              v-if="ratingHelpOpen"
              @click="ratingHelpOpen = false"
              class="bigstat-tooltip-text"
            >
              Ratings are calculated by comparing mean Brawler trophies to all players on Brawl Time Ninja.
              <ul>
                <li>C: Better than 50%</li>
                <li>B: Better than 90%</li>
                <li>A: Better than 95%</li>
                <li>S: Better than 99%</li>
              </ul>
              <span class="bigstat-tooltip-close">x</span>
            </p>
          </div>
          <div class="bigstat-right bigstat-label text-xl">
            <dt class="w-24">
              Account Rating
            </dt>
          </div>
        </dl>
      </div>
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
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'lifetime'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Personal Records
      </h2>
    </div>

    <div class="section">
      <player-lifetime :stats="player.stats"></player-lifetime>
    </div>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'pro'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Are you a Pro?
      </h2>
    </div>

    <div class="section">
      <player-percentiles :player="player"></player-percentiles>
    </div>

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
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gamemodes'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Game Mode Win Rates
      </h2>
    </div>

    <div class="section">
      <div class="overflow-x-auto -mx-4 overflow-y-hidden scrolling-touch flex md:flex-wrap">
        <lazy
          v-for="(stats, index) in playerModeStats"
          :key="stats.mode"
          :render="showAllModes || index <= 3"
          :class="{
            'md:hidden': !showAllModes && index > 3,
          }"
          class="flex-0-auto mx-4 md:mx-auto w-64 md:w-1/2 h-48 md:h-auto card-wrapper"
          distance="600px"
        >
          <player-mode-card
            :mode="stats.mode"
            :stats="stats"
            :active-map-meta="activeMapMeta"
            :player-brawlers="Object.values(player.brawlers)"
          ></player-mode-card>
        </lazy>
      </div>

      <div class="mt-1 w-full flex justify-end">
        <button
          class="mr-3 button md:button-md hidden"
          :class="{ 'md:block': !showAllModes && playerModeStats.length > 3 }"
          @click="showAllModes = true; $ga.event('gamemodes', 'show_all')"
        >
          Show More
        </button>

        <player-tips
          :player="player"
          :active-map-meta="activeMapMeta"
          class="mr-3 button md:button-md"
        ></player-tips>

        <nuxt-link
          class="button md:button-md"
          to="/tier-list/map"
        >
          Open Map Tier List
        </nuxt-link>
      </div>
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
            class="button button-md"
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
        v-if="!isApp && testGroup != 'player-only-top-ad'"
        :ins-style="testGroup == 'player-small-ads' ? 'display: block; max-height: 100px; height: 100%;' : 'display: block'"
        :data-ad-format="testGroup == 'player-small-ads' ? 'horizontal' : 'auto'"
        data-full-width-responsive="false"
        ins-class="w-screen md:w-full -mx-4 ad-section"
        id="ezoic-pub-ad-placeholder-101"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </client-only>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'battles'),
        once: true,
      }"
      class="section-heading flex flex-wrap items-center"
    >
      <h2 class="text-2xl font-semibold">
        Battle Log
      </h2>

      <div class="w-full md:w-auto md:ml-auto mt-2 flex items-center">
        <span class="text-sm text-grey-lighter">
          Updating again in {{ Math.floor(refreshSecondsLeft / 60) }}m {{ refreshSecondsLeft % 60 }}s
        </span>
        <button
          class="ml-auto md:ml-4 button button-sm"
          @click="refresh"
        >
          Refresh now
        </button>
      </div>
    </div>

    <div class="section">
      <dl class="mt-3 mb-6 bigstat-wrapper" v-if="totalBattles !== 0">
        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light">
            {{ Math.floor(winRate * totalBattles) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Wins Recorded
          </dt>
        </div>

        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light">
            {{ Math.floor((1 - winRate) * totalBattles) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Losses Recorded
          </dt>
        </div>

        <div class="bigstat-container">
          <dd class="bigstat-left bigstat-number bigstat-number--light leading-none">
            {{ formatMode(bestMode) }}
          </dd>
          <dt class="bigstat-right bigstat-label text-xl">
            Best Mode
          </dt>
        </div>
      </dl>

      <div
        v-if="player.battles.length > 0"
        class="overflow-x-auto -mx-4 overflow-y-hidden scrolling-touch flex flex-wrap flex-1"
      >
        <div class="w-full mx-2 mb-2 flex md:flex-wrap min-width-min-content">
          <div
            v-for="(battle, index) in player.battles"
            :key="battle.timestamp"
            class="border-r-2 border-t-2 border-b-2 border-black w-12 h-12 bg-primary-dark flex justify-center items-center"
            :class="{
              'rounded-l border-l-2': index == 0,
              'rounded-r': index == player.battles.length - 1,
              'bg-red-500': battle.victory === false,
              'bg-green-500': battle.victory === true,
            }"
          >
            <media-img :path="'/modes/' + battle.event.mode + '/icon'"
              size="120"
              clazz="w-8 mx-auto my-auto"
            ></media-img>
          </div>
        </div>

        <div class="w-full flex md:flex-wrap">
          <lazy
            v-for="(battle, index) in player.battles"
            :key="battle.timestamp"
            :class="{ 'md:hidden': battlePage * battlePageSize <= index }"
            :render="index <= battlePageSize"
            class="flex-0-auto md:flex-initial md:w-1/2 lg:w-1/2 px-2"
            distance="640px"
          >
            <div class="w-80" style="height: 214px" slot="placeholder"></div>
            <player-battle :battle="battle" :playerTag="player.tag" />
          </lazy>
        </div>

        <div
          v-show="battlePage * battlePageSize < player.battles.length"
          class="mt-2 w-full text-right hidden md:block"
        >
          <button
            class="button button-md"
            @click="battlePage++; $ga.event('battlelog', 'load_more', battlePage)"
          >
            Load More Battles
          </button>
        </div>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp && player.battles.length > 0 && testGroup != 'player-only-top-ad'"
        :ins-style="testGroup == 'player-small-ads' ? 'display: block; max-height: 100px; height: 100%;' : 'display: block'"
        :data-ad-format="testGroup == 'player-small-ads' ? 'horizontal' : 'auto'"
        data-full-width-responsive="false"
        ins-class="w-screen md:w-full -mx-4 ad-section"
        id="ezoic-pub-ad-placeholder-102"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </client-only>

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'brawlers'),
        once: true,
      }"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Brawlers
      </h2>
    </div>

    <dl class="section leading-tight md:mx-4 flex flex-wrap py-4 px-6">
      <div
        v-for="(stat, brawlerName) in player.heroStats"
        :key="brawlerName"
        class="md:text-center text-xl my-1 w-full md:w-auto md:mx-auto"
      >
        <dt class="inline md:block md:text-2xl font-semibold">{{ stat.label }}</dt>
        <dl class="inline md:block float-right md:float-none text-primary-lighter md:mt-1 font-bold">{{ stat.value }}</dl>
      </div>
    </dl>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <lazy
          v-for="brawler in brawlers"
          :key="brawler.id"
          class="card-wrapper w-full md:flex-1"
          distance="200px"
        >
          <div class="w-80" style="height: 107px" slot="placeholder"></div>
          <player-brawler-card
            :brawler="brawler"
            :brawler-winrates="player.winrates.brawler"
          />
        </lazy>
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

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { formatMode, getBest } from '~/lib/util'

export default {
  name: 'PlayerProfile',
  head() {
    const description = `Brawl Time for ${this.player.name}: ${Math.floor(this.player.hoursSpent)} hours spent, ${this.player.trophies} Trophies. Track Brawl Stars stats, calculate your Win Rate and get Tips.`
    return {
      title: this.player.name,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      error: '',
      battlePage: 1,
      battlePageSize: 4,
      refreshSecondsLeft: 180,
      showAllModes: false,
      ratingHelpOpen: false,
      recentHelpOpen: false,
      currentEvents: [],
      activeMapMeta: {},
      leaderboard: [],
      guides: [],
      additionalPlayerDataLoaded: false,
      formatMode,
    }
  },
  computed: {
    funStats() {
      return {
        recharges: {
          // measured with AccuBattery on my phone
          label: 'empty batteries',
          value: (h) => h / 4.27
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: 'toilet breaks',
          value: (h) => h / (102 / 7 / 60)
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: 'books unread',
          value: (h) => h / 7.72
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: 'songs unheard',
          value: (h) => h / (3.7 / 60)
        },
      }
    },
    brawlersUnlocked() {
      return Object.keys(this.player.brawlers).length
    },
    trophiesPerHour() {
      return this.player.trophies / Math.max(this.player.hoursSpent, 1)
    },
    trophiesGoal() {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * this.totalBrawlers
    },
    relevantGuides() {
      return this.guides.slice(0, 3)
    },
    brawlers() {
      const brawlersKV = [...Object.entries(this.player.brawlers)]
      return brawlersKV.map(([brawlerId, brawler]) => ({
        id: brawlerId,
        ...brawler
      }))
    },
    topBrawlerId() {
      const brawlerIds = [...Object.keys(this.player.brawlers)]
      return brawlerIds[0]
    },
    accountRating() {
      const medTrophies = this.trophiesGoal / this.totalBrawlers
      // end of Jan 2019 season *average* (not med!) trophies per brawler:
      // 290 - 25%ile
      // 380 - 50%ile
      // 530 - 90%ile
      // 550 - 95%ile
      // 620 - 99%ile
      // TODO 2020-08-08 end of season data: mu = 457, sigma = 182
      if (medTrophies <= 290) {
        return '?'
      }
      if (medTrophies <= 380) {
        return 'C'
      }
      if (medTrophies <= 530) {
        return 'B'
      }
      if (medTrophies <= 550) {
        return 'A'
      }
      return 'S'
    },
    totalBattles() {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.picks
      }
      return this.player.battles.length
    },
    winRate() {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.winRate
      }
      if (this.player.battles.length == 0) {
        return 0
      }
      return this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length
    },
    battlesByMode() {
      return this.player.battles.reduce((battlesByMode, battle) => ({
        ...battlesByMode,
        [battle.event.mode]: [...(battlesByMode[battle.event.mode] || []), battle],
      }), {})
    },
    playerModeStats() {
      const statsByMode = []
      if (this.player.winrates != undefined && this.player.winrates.mode != undefined) {
        for (let mode in this.player.winrates.mode) {
          const stats = this.player.winrates.mode[mode].stats
          const wins = Math.floor(stats.winRate * stats.picks)
          const losses = Math.floor((1 - stats.winRate) * stats.picks)
          statsByMode.push({
            mode,
            winRate: stats.winRate,
            picks: stats.picks,
            wins,
            losses,
          })
        }
      } else {
        for (let mode in this.battlesByMode) {
          const picks = this.battlesByMode[mode].length
          const wins = this.battlesByMode[mode].filter(b => b.victory).length
          const losses = picks - wins
          const winRate = wins / picks
          statsByMode.push({
            mode,
            winRate,
            picks,
            wins,
            losses,
          })
        }
      }
      statsByMode.sort((m1, m2) => m2.picks - m1.picks)
      return statsByMode
    },
    trophyRate() {
      if (this.player.winrates != undefined && this.player.winrates.total != undefined) {
        return this.player.winrates.total.stats.trophyChange || 0
      }
      const trophyChanges = this.player.battles
        .map((battle) => battle.trophyChange)
        .filter((trophyChange) => trophyChange != undefined)
      if (trophyChanges.length == 0) {
        return 0
      }
      return trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
    },
    bestMode() {
      let avgTrophyChangeByMode = []
      if (this.player.winrates != undefined && this.player.winrates.mode != undefined) {
        avgTrophyChangeByMode = Object.values(this.player.winrates.mode || {})
          .map((m) => ({ mode: m.name, trophyChange: m.stats.trophyChange }))
          .filter((m) => m.trophyChange != undefined)
      } else {
        const rankedBattles = (battles) => battles.filter(b => b.trophyChange != undefined)
        avgTrophyChangeByMode = [...Object.entries(this.battlesByMode)]
          .map(([mode, battles]) => [mode, rankedBattles(battles)])
          .filter(([mode, battles]) => battles.length > 0)
          .map(([mode, battles]) => ({
            mode,
            trophyChange: battles.reduce((trophies, b) => trophies + b.trophyChange, 0) / battles.length,
          }))
      }
      const modes = avgTrophyChangeByMode
        .sort((m1, m2) => m2.trophyChange - m1.trophyChange)
        .map((m) => m.mode)
      if (modes.length == 0) {
        return '?'
      }
      return modes[0]
    },
    ...mapState({
      blog: state => state.blog,
      player: state => state.player,
      totalBrawlers: state => state.totalBrawlers,
      installBannerDismissed: state => state.installBannerDismissed,
      testGroup: state => state.testGroup,
      isApp: state => state.isApp,
    }),
    ...mapGetters({
      rank: 'playerRank',
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
  async asyncData({ $axios, $content }) {
    const [events, activeMapMeta, leaderboard, guides] = await Promise.all([
      $axios.$get('/api/events/active').catch(() => ({ active: [], upcoming: [] })),
      $axios.$get('/api/meta/map/events').catch(() => ({})),
      $axios.$get('/api/leaderboard/hours').catch(() => []),
      $content('guides').sortBy('createdAt', 'desc').fetch(),
    ])
    return {
      currentEvents: events.current,
      leaderboard,
      activeMapMeta,
      guides,
    }
  },
  mounted() {
    if (process.client) {
      this.$nextTick(() => {
        const playerHours = Math.max(this.player.hoursSpent, 1)
        const animationDuration = 3000
        const frameDuration = 50
        const k = Math.log(playerHours) / (animationDuration / frameDuration)

        let hoursSpent = 0
        const hoursTimer = () => setTimeout(() => {
          hoursSpent += k * (playerHours - hoursSpent)
          if (Math.floor(hoursSpent) >= playerHours - 1) {
            hoursSpent = playerHours
          }
          if (this.$refs['counter-hours'] == undefined) {
            // user navigated to a different page
            return
          }

          this.$refs['counter-hours'].textContent = Math.floor(hoursSpent)
          Object.values(this.funStats).forEach((stat, index) => {
            this.$refs['counter-funstats'][index].textContent = Math.floor(stat.value(hoursSpent))
          })

          if (Math.floor(hoursSpent) < playerHours) {
            hoursTimer()
          }
        }, frameDuration)
        hoursTimer()
      })
    }

    setTimeout(() => this.refreshTimer(), 15 * 1000)
  },
  methods: {
    async refreshTimer() {
      this.refreshSecondsLeft -= 15
      if (this.refreshSecondsLeft <= 0) {
        await this.refresh()
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
      loadPlayerHistory: 'loadPlayerHistory',
      loadPlayerWinrates: 'loadPlayerWinrates',
      install: 'install',
    }),
  },
}
</script>

<style scoped>
.bigstat-wrapper {
  @apply flex flex-wrap mx-auto;
}

@screen md {
  .bigstat-wrapper {
    @apply justify-center mx-0;
  }
}

.bigstat-container {
  @apply flex flex-wrap justify-center items-center mt-2 w-full;
}

@screen xl {
  .bigstat-container {
    @apply mx-6 w-auto;
  }
}

.bigstat-left {
  @apply w-1/2 text-right flex justify-end items-center pr-2;
}

.text-5vw {
  font-size: 5vw;
}

@responsive {
  .text-4xl\! {
    @apply text-4xl;
  }
}

.bigstat-right {
  @apply w-1/2 text-left flex justify-start items-center pl-2;
}

.bigstat-label {
  @apply leading-none text-white;
}

.bigstat-number {
  @apply text-5xl font-bold text-secondary;
}

.bigstat-tooltip-btn {
  @apply absolute mt-2 mr-1 text-primary-light font-semibold underline top-0 right-0;
}

.bigstat-tooltip-text {
  @apply absolute top-0 left-0 text-sm w-48 bg-black text-grey-lighter rounded px-2 py-1 ml-2 text-left;
}

.bigstat-tooltip-close {
  @apply text-primary-light font-semibold absolute top-0 right-0 mr-1 cursor-pointer;
}

.bigstat-number--light {
  @apply text-3xl text-primary-light;
}

.min-width-min-content {
 min-width: min-content;
}
</style>
