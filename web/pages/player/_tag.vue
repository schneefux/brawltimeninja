<template>
  <div class="page container">
    <adsense
      v-if="ads"
      root-class="ad-section"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="9429125351"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div class="section-heading"
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
          <div>
            <p ref="counter-hours" class="text-5xl text-secondary font-bold">
              ...
              <!-- set by ref -->
            </p>
            <p class="text-3xl text-white">
              hours spent
            </p>
          </div>
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

        <div class="hidden md:flex flex-wrap justify-between z-20">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto px-2 my-3"
          >
            <p ref="counter-funstats" class="text-3xl text-secondary font-semibold">
              ...
              <!-- set by ref -->
            </p>
            <p class="text-2xl text-grey-lighter">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="section bigstat-wrapper">
        <div
          v-if="player.clubName !== undefined && player.clubName != ''"
          class="bigstat-container"
        >
          <div class="bigstat-left text-6vw md:text-4xl!">
            <div class="" style="margin-top: -0.125em">
              [
            </div>
            <div class="mx-2 text-primary-light font-semibold text-center">
              {{ player.clubName.replace(/ /g, '&nbsp;') }}
            </div>
            <div class="" style="margin-top: -0.125em">
              ]
            </div>
          </div>
          <div class="bigstat-right bigstat-label text-4xl">
            Club
          </div>
        </div>

        <div class="bigstat-container">
          <div class="flex flex-wrap">
            <div class="bigstat-left bigstat-number">
              {{ player.trophies.toLocaleString() }}
            </div>
            <div class="bigstat-right bigstat-label text-4xl">
              Trophies
            </div>
          </div>

          <div
            class="w-full max-w-xs mx-12 md:mx-4 my-3 md:w-40 relative"
          >
            <div
              v-if="player.history.length > 1"
              class="h-12"
            >
              <span class="absolute text-primary-light text-shadow-primary-darker text-lg font-semibold left-0 top-0">
                {{ player.trophies >= player.history[0].trophies ? '+' : '' }}{{ player.trophies - player.history[0].trophies }}
              </span>
              <span class="absolute text-sm text-grey-light text-shadow-grey-darkest -mb-2 right-0 bottom-0">
                since {{ daysSincePlayerHistoryStart }}d ago
              </span>
              <svg
                viewBox="0 0 240 32"
                preserveAspectRatio="none"
                class="absolute left-0 bottom-0 w-full h-8 overflow-visible"
              >
                <polyline
                  :points="playerHistoryPoints.map(([x, y]) => `${x*240},${(1-y)*32} `)"
                  fill="none"
                  stroke="#f2d024"
                  stroke-width="4"
                /> <!-- stroke: secondary-dark -->
              </svg>
            </div>
            <span
              v-else
              class="md:text-sm italic"
            >
              Visit again to see progress charts
            </span>
          </div>
        </div>

        <div
          v-if="brawlersUnlocked < totalBrawlers"
          class="bigstat-container"
        >
          <div class="bigstat-left bigstat-number">
            {{ Math.floor(trophiesGoal).toLocaleString() }}
          </div>
          <div class="bigstat-right">
            <p class="bigstat-label w-48 pt-1">
              <span class="text-xl">
                Potential&nbsp;Trophies
              </span>
              <span class="text-sm">
                (with&nbsp;all&nbsp;Brawlers&nbsp;unlocked)
              </span>
            </p>
          </div>
        </div>

        <div class="bigstat-container" v-if="trophyRate !== 0">
          <div class="bigstat-left bigstat-number">
            {{ trophyRate.toFixed(2) }}
          </div>
          <div class="bigstat-right bigstat-label text-xl">
            <p class="w-24">
              Recent&nbsp;Trophies per&nbsp;battle
            </p>
          </div>
        </div>

        <div class="bigstat-container">
          <div class="bigstat-left relative">
            <span class="bigstat-number">{{ accountRating }}</span>
            <button
              @click="ratingHelpOpen = true"
              class="bigstat-tooltip-btn"
            >?</button>
            <p
              v-show="ratingHelpOpen"
              @click="ratingHelpOpen = false"
              class="bigstat-tooltip-text"
              style="display: none;"
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
            <p class="w-24">
              Account Rating
            </p>
          </div>
        </div>
      </div>
    </div>

    <adsense
      v-if="ads && !isApp"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="3933066188"
      root-class="w-full ad-section"
      data-ad-format="auto"
      data-full-width-responsive
    />

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
        <div
          v-for="(mode, index) in Object.values(player.modes)"
          :key="mode.label"
          :class="{
            'md:hidden': !showAllModes && index > 3,
          }"
          class="flex-0-auto mx-4 md:mx-auto w-64 md:w-1/2 h-40 md:h-auto card-wrapper"
        >
          <div
            class="card bg-center bg-cover flex flex-wrap justify-between h-full relative"
            :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url(\'' + require(`~/assets/images/mode/background/${mode.background}`) + '\')'"
          >
            <div class="card-content">
              <div class="card-header text-white">
                {{ mode.label }}
              </div>
              <p
                v-for="(stat, statName) in mode.stats"
                :key="statName"
                class="card-props"
              >
                <span class="card-prop-value">{{ stat.value }}</span>
                <span class="card-prop-label">{{ stat.label }}</span>
              </p>
            </div>
            <img
              v-if="mode.icon"
              :src="require(`~/assets/images/mode/icon/${mode.icon}`)"
              class="absolute top-0 right-0 h-12 self-center mr-6 my-4"
            >
          </div>
        </div>

        <div
          v-show="!showAllModes"
          class="mt-2 w-full text-right hidden md:block"
        >
          <button
            class="button button-md"
            @click="showAllModes = true; $ga.event('gamemodes', 'show_all')"
          >
            Load all Modes
          </button>
        </div>
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

    <adsense
      v-if="ads && !isApp"
      id="ezoic-pub-ad-placeholder-101"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="1752268168"
      root-class="ad-section"
      data-ad-format="auto"
      data-full-width-responsive
    />

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
      <div class="mt-3 mb-6 bigstat-wrapper" v-if="totalBattles !== 0">
        <div class="bigstat-container">
          <span class="bigstat-left bigstat-number bigstat-number--light">
            {{ totalBattles }}
          </span>
          <span class="bigstat-right bigstat-label text-xl">
            Battles Recorded
          </span>
        </div>

        <div class="bigstat-container">
          <span class="bigstat-left bigstat-number bigstat-number--light">
            {{ Math.floor(winRate * 100) }}%
          </span>
          <span class="bigstat-right bigstat-label text-xl">
            Win&nbsp;Rate
          </span>
        </div>

        <div class="bigstat-container">
          <span class="bigstat-left bigstat-number bigstat-number--light whitespace-no-wrap">
            {{ formatMode(bestMode) }}
          </span>
          <span class="bigstat-right bigstat-label text-xl">
            Best Mode
          </span>
        </div>
      </div>

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
          <event
            v-for="(battle, index) in player.battles"
            :key="battle.timestamp"
            :mode="battle.event.mode"
            :map="battle.event.map"
            :class="{ 'md:hidden': battlePage * battlePageSize <= index }"
            size="w-80"
            class="flex-0-auto md:flex-initial md:w-1/2 lg:w-1/2 px-2"
            infobar
          >
            <template v-slot:infobar>
              <div class="flex justify-between">
                <div>
                  <span class="mr-2">
                    {{ battle.result }}
                  </span>
                  <span v-if="battle.trophyChange !== undefined">
                    <template v-if="battle.trophyChange > 0">
                      +{{ battle.trophyChange }}
                    </template>
                    <template v-else>
                      {{ battle.trophyChange }}
                    </template>
                    <img
                      src="~/assets/images/icon/trophy_optimized.png"
                      class="w-4 inline"
                    >
                  </span>
                </div>
                <span>
                  <template v-if="hoursSinceDate(battle.timestamp) == 0">
                    just now
                  </template>
                  <template v-else>
                    {{ hoursSinceDate(battle.timestamp) }}h ago
                  </template>
                </span>
              </div>
            </template>
            <template v-slot:content>
              <div class="flex flex-wrap justify-center">
                <div
                  v-for="(team, index) in battle.teams"
                  :key="index"
                  :class="{
                    'mt-8': battle.teams.length == 3,
                    'mx-1 rounded-sm': team.length == 2,
                  }"
                  class="flex flex-wrap justify-center z-10 my-1"
                >
                  <nuxt-link
                    v-for="mate in team"
                    :key="mate.tag"
                    :rel="mate.brawlerTrophies == undefined || mate.brawlerTrophies < 1300 ? 'nofollow' : ''"
                    :to="`/player/${mate.tag}`"
                    class="w-14 h-14 bg-black py-px relative overflow-hidden"
                    :class="{
                      'border-2 border-gray-300': mate.tag == player.tag,
                      'mx-1 rounded-sm': team.length != 2,
                    }"
                  >
                    <media-img
                      :path="'/brawlers/' + mate.brawler + '/avatar'"
                      size="80"
                      clazz="h-8"
                    ></media-img>
                    <div class="absolute top-0 right-0 w-12 text-right m-px" v-if="mate.brawlerTrophies">
                      <div class="w-full flex">
                        <span
                          class="w-8 text-xs font-semibold text-shadow text-secondary-lighter"
                        >
                          {{ mate.brawlerTrophies }}
                        </span>
                        <img
                          src="~/assets/images/icon/trophy_optimized.png"
                          class="w-4 h-4 ml-px"
                        >
                      </div>
                      <div class="w-full">
                        <span
                          v-if="mate.isBigbrawler"
                          class="text-sm"
                        >
                          💀
                        </span>
                      </div>
                    </div>
                    <span
                      class="text-xs whitespace-no-wrap m-px"
                      :class="{
                        'link': mate.tag != player.tag,
                        'text-secondary': mate.tag == player.tag,
                      }"
                    >
                      {{ mate.name }}
                    </span>
                  </nuxt-link>
                </div>
              </div>
            </template>
          </event>
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

    <adsense
      v-if="ads && !isApp && player.battles.length > 0"
      id="ezoic-pub-ad-placeholder-102"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="4129048243"
      root-class="ad-section"
      data-ad-format="auto"
      data-full-width-responsive
    />

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

    <div class="section leading-tight md:mx-4 flex flex-wrap py-4 px-6">
      <p
        v-for="(stat, brawlerName) in player.heroStats"
        :key="brawlerName"
        class="md:text-center text-xl my-1 w-full md:w-auto md:mx-auto"
      >
        <span class="md:block md:text-2xl font-semibold">{{ stat.label }}</span>
        <span class="md:block float-right md:float-none text-primary-lighter md:mt-1 font-bold">{{ stat.value }}</span>
      </p>
    </div>

    <div
      v-if="eventRecommendations.length > 0"
      class="section md:mx-4 py-4 px-3"
    >
      <div class="mb-3">
        <div class="text-left text-lg">
          💡
          Play your lowest Brawlers' strengths
        </div>
      </div>
      <p
        v-for="tip in eventRecommendations.slice(0, tipsPage * tipsPageSize)"
        :key="tip.id"
        class="mt-2 px-3"
      >
        {{ tip.phrase }}
        <span class="capitalize text-primary-lighter">
          {{ tip.brawler.name.toLowerCase() }}
        </span>
        in
        <nuxt-link
          :to="`/tier-list/map/${tip.event.id}`"
          class="link inline-block"
        >
          {{ formatMode(tip.event.mode) }} - {{ tip.event.map }}
        </nuxt-link>.
      </p>
      <button
        v-show="tipsPage * tipsPageSize < eventRecommendations.length"
        class="mt-3 button button-sm"
        @click="tipsPage++; $ga.event('tips', 'load_more', tipsPage)"
      >
        Load More Tips
      </button>
      <button
        v-show="notificationsAllowed"
        class="ml-2 button button-sm"
        @click="notifyTips"
      >
        Send as Notification
      </button>
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <div
          v-for="brawler in brawlers"
          :key="brawler.id"
          class="card-wrapper w-full md:flex-1"
        >
          <brawler-card
            :title="brawler.name"
            :brawler="brawler.id"
          >
            <template v-slot:history>
              <div
                v-if="brawler.id in daysSinceBrawlerHistoryStart && brawler.history.length > 1"
                class="w-32 relative mx-auto my-2"
              >
                <span class="absolute text-sm text-grey-light text-shadow-primary-dark font-semibold left-0 top-0 -mt-2 -ml-1">
                  {{ brawler.trophies >= brawler.history[0].trophies ? '+' : '' }}{{ brawler.trophies - brawler.history[0].trophies }}
                </span>
                <span class="absolute text-xs text-grey-light text-shadow-primary-dark -mb-2 right-0 bottom-0">
                  since {{ daysSinceBrawlerHistoryStart[brawler.id] }}d ago
                </span>
                <svg
                  viewBox="0 0 128 32"
                  preserveAspectRatio="none"
                  class="w-full h-8 overflow-visible"
                >
                  <polyline
                    :points="brawlerHistoryPoints[brawler.id].map(([x, y]) => `${x*128},${(1-y)*32} `)"
                    fill="none"
                    stroke="#f2d024"
                    stroke-width="4"
                  /> <!-- stroke: secondary-dark -->
                </svg>
              </div>
            </template>
            <template v-slot:stats>
              <table>
                <tr
                  v-if="brawler.history.length <= 1"
                  class="card-props"
                >
                  <td class="text-center">
                    <img
                      src="~/assets/images/icon/leaderboards_optimized.png"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ brawler.rank }}
                  </td>
                  <td class="card-prop-label">
                    Rank
                  </td>
                </tr>
                <tr class="card-props">
                  <td class="text-center">
                    <img
                      src="~/assets/images/icon/trophy_optimized.png"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ brawler.trophies }}
                  </td>
                  <td class="card-prop-label">
                    Trophies
                  </td>
                </tr>
                <tr class="card-props">
                  <td class="text-center">
                    <img
                      src="~/assets/images/icon/trophy_optimized.png"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ brawler.highestTrophies }}
                  </td>
                  <td class="card-prop-label">
                    Max Trophies
                  </td>
                </tr>
                <tr class="card-props">
                  <td class="text-center">
                    <img
                      v-if="brawler.power < 10"
                      src="~/assets/images/icon/powerpoint_optimized.png"
                      class="card-prop-icon"
                    >
                    <img
                      v-else
                      src="~/assets/images/icon/starpower_optimized.png"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ brawler.power }}
                  </td>
                  <td class="card-prop-label">
                    Power Level
                  </td>
                </tr>
              </table>
            </template>
          </brawler-card>
        </div>
      </div>
    </div>

    <div
      v-if="relevantGuides.length > 0"
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
import { formatMode, capitalizeWords, scaleMinMax, zip, hoursSinceDate } from '~/lib/util'
import Blogroll from '~/components/blogroll'
import BrawlerCard from '~/components/brawler-card'
import MediaImg from '~/components/media-img'
import Event from '~/components/event'

export default {
  name: 'PlayerProfile',
  components: {
    Blogroll,
    BrawlerCard,
    MediaImg,
    Event,
  },
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
      battlePageSize: 3,
      refreshSecondsLeft: 180,
      tipsPage: 1,
      tipsPageSize: 3,
      notificationsAllowed: false,
      showAllModes: false,
      ratingHelpOpen: false,
      hoursSinceDate,
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
    playerHistoryPoints() {
      const dates = this.player.history.map(({ timestamp }) => Date.parse(timestamp))
      const datesS = scaleMinMax(dates)
      const trophies = this.player.history.map(({ trophies }) => trophies)
      const trophiesS = scaleMinMax(trophies)
      return zip(datesS, trophiesS)
    },
    brawlerHistoryPoints() {
      const brawlersS = {}
      Object.entries(this.player.brawlers).forEach(([brawlerId, brawler]) => {
        if (brawler.history.length <= 1) {
          brawlersS[brawlerId] = []
          return
        }
        const dates = brawler.history.map(({ timestamp }) => Date.parse(timestamp))
        const datesS = scaleMinMax(dates)
        const trophies = brawler.history.map(({ trophies }) => trophies)
        const trophiesS = scaleMinMax(trophies)
        brawlersS[brawlerId] = zip(datesS, trophiesS)
      })
      return brawlersS
    },
    daysSincePlayerHistoryStart() {
      if (this.player.history.length == 0) {
        return 0
      }
      const start = Date.parse(this.player.history[0].timestamp)
      const now = (new Date()).getTime()
      return Math.ceil((now - start) / 1000 / 3600 / 24)
    },
    daysSinceBrawlerHistoryStart() {
      const brawlersMin = {}
      Object.entries(this.player.brawlers).forEach(([brawlerId, brawler]) => {
        if (brawler.history.length > 1) {
          const start = Date.parse(brawler.history[0].timestamp)
          const now = (new Date()).getTime()
          brawlersMin[brawlerId] = Math.ceil((now - start) / 1000 / 3600 / 24)
        }
      })
      return brawlersMin
    },
    relevantGuides() {
      // shuffle posts
      const posts = this.blog.guides.concat().sort(() => 0.5 - Math.random())
      return posts.slice(0, 3)
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
    eventRecommendations() {
      const phrases = [
        'Get more trophies by playing',
        'You can push',
        'Try to play',
        'To gain some trophies, play',
        'Other players had success with',
        'You should try',
        'For easy wins, play',
      ]
      const recommendations = []
      const worstBrawlers = [...Object.values(this.player.brawlers)]
        .sort((b1, b2) => b1.trophies - b2.trophies)

      // sort by score =
      // index [ brawlers owned by player, worst first ]
      // *
      // index [ brawler in map meta, best first ]
      this.currentEvents.forEach((event) => {
        // reject unranked
        if (['Big Game', 'Boss Fight'].includes(event.mode)) {
          return
        }

        // TODO remove this - trying to debug undefined error in prod
        const best = this.bestByEvent[event.id]
        console.log(JSON.stringify(worstBrawlers))
        if (event.id in this.bestByEvent && best.some(b => b.name == undefined)) {
          console.log(JSON.stringify(best))
        }

        worstBrawlers.forEach((brawler) => {
          if (!(event.id in this.bestByEvent)) {
            return
          }
          const bestBrawlers = this.bestByEvent[event.id]
          const rankIndex = bestBrawlers.findIndex(b => (b.name||'').toLowerCase() === (brawler.name||'').toLowerCase())
          if (rankIndex === -1) {
            return
          }

          const score = (brawler.trophies + 1) * (rankIndex / bestBrawlers.length + 1)
          recommendations.push({
            id: `${brawler.name} ${event.id}`,
            phrase: phrases[Math.round(event.id / 31) % phrases.length],
            score,
            brawler,
            event,
          })
        })
      })
      recommendations.sort((r1, r2) => r1.score - r2.score)
      return recommendations.slice(0, 20)
    },
    accountRating() {
      const medTrophies = this.trophiesGoal / this.totalBrawlers
      // end of Jan 2019 season *average* (not med!) trophies per brawler:
      // 290 - 25%ile
      // 380 - 50%ile
      // 530 - 90%ile
      // 550 - 95%ile
      // 620 - 99%ile
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
      if (this.player.totalStats.battles !== undefined) {
        return this.player.totalStats.battles
      }
      return this.player.battles.length
    },
    winRate() {
      if (this.player.totalStats.winRate !== undefined) {
        return this.player.totalStats.winRate
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
    trophyRate() {
      if (this.player.totalStats.trophyRate !== undefined) {
        return this.player.totalStats.trophyRate
      }
      const rankedBattles = (battles) => battles.filter(b => b.trophyChange !== undefined)
      const trophyChanges = this.player.battles
        .map((battle) => battle.trophyChange)
        .filter((trophyChange) => trophyChange !== undefined)
      if (trophyChanges.length == 0) {
        return 0
      }
      return trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
    },
    bestMode() {
      let avgTrophyChangeByMode = []
      if (this.player.totalStats.byMode !== undefined) {
        avgTrophyChangeByMode = [...Object.values(this.player.totalStats.byMode || {})]
          .filter((m) => m.trophyChange !== undefined)
      } else {
        const rankedBattles = (battles) => battles.filter(b => b.trophyChange !== undefined)
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
      ads: state => state.adsEnabled,
      blog: state => state.blog,
      player: state => state.player,
      totalBrawlers: state => state.totalBrawlers,
      currentEvents: state => state.currentEvents,
      installBannerDismissed: state => state.installBannerDismissed,
      isApp: state => state.isApp,
      bestByEvent: state => state.bestByEvent,
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
    if (process.client && 'Notification' in window) {
      this.notificationsAllowed = Notification.permission !== 'denied'
    }
    if (process.client) {
      this.loadPlayerWinrates()
      this.loadPlayerHistory()
      this.loadCurrentMeta()
      this.loadLeaderboard()
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
      await this.loadCurrentMeta()
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
      if (visible && '$ga' in this) {
        this.$ga.event('profile', 'scroll', section)
      }
    },
    async notifyTips() {
      if (!(Notification.permission in ['denied', 'granted'])) {
        await Notification.requestPermission()
      }

      if (Notification.permission === 'granted') {
        this.$ga.event('profile', 'send_notification', 'tips')
        this.notificationsAllowed = true

        const sw = await navigator.serviceWorker.ready

        const eventDescription = event => event.mode + ' - ' + event.map
        const N = 5
        const topNByEvent = this.eventRecommendations
          .reduce((topNByEvent, recommendation) => ({
            ...topNByEvent,
            [eventDescription(recommendation.event)]: [
              ...(topNByEvent[eventDescription(recommendation.event)] || []),
              capitalizeWords(recommendation.brawler.name.toLowerCase())
            ].slice(0, N)
          }), {})
        const tips = [...Object.entries(topNByEvent)]
          .map(([eventDescription, topN]) => 'Play ' + topN.join(', ') + ' in ' + eventDescription)
        sw.showNotification(`Tips for ${this.player.name} by Brawl Time Ninja`, {
          body: tips.join('\n')
        })
      } else {
        this.notificationsAllowed = false
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
      loadLeaderboard: 'loadLeaderboard',
      loadCurrentMeta: 'loadCurrentMeta',
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

.text-6vw {
  font-size: 6vw;
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
