<template>
  <div class="container mx-auto p-4" >
    <div class="section-heading">
      <img
        v-if="Object.keys(player.brawlers).length > 0"
        :src="require(`~/assets/images/hero/model/${topBrawlerId}.png`)"
        class="absolute w-1/3 md:w-1/6 mr-2 md:mr-10 right-0 z-0 opacity-25"
      />
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
            <p class="text-5xl text-secondary font-bold">
              {{ Math.floor(hoursSpent) }}
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

        <p class="w-full md:w-auto text-xl my-4 mx-auto">
          which is about
        </p>

        <div class="flex flex-wrap justify-between">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto px-2 my-3"
          >
            <p class="text-3xl text-secondary font-semibold">
              {{ Math.floor(stat.value) }}
            </p>
            <p class="text-2xl text-grey-lighter">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="section flex flex-wrap justify-left md:justify-center mx-auto md:mx-0">
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
          v-if="brawlersUnlocked != totalBrawlers"
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

        <div class="bigstat-container">
          <div class="bigstat-left bigstat-number">
            {{ Math.floor(trophiesPerHour) }}
          </div>
          <div class="bigstat-right bigstat-label text-xl">
            <p class="w-24">
              Trophies per&nbsp;hour
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="installPrompt !== undefined && !installBannerDismissed"
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
            @click="install"
          >
            <span class="mr-1">📥</span>
            Install
          </button>
        </div>
      </div>
    </div>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Game Modes
      </h2>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          v-for="(mode, modeName) in player.modes"
          :key="modeName"
          class="w-full md:w-1/2 card-wrapper mx-auto"
        >
          <div
            class="card bg-center bg-cover flex flex-wrap justify-between"
            :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url(\'' + require(`~/assets/images/mode/background/${mode.background}`) + '\')'"
          >
            <div class="card-content">
              <div class="card-header text-white">
                {{ mode.label }}
              </div>
              <p
                v-for="(stat, statName) in mode.stats"
                :key="statName"
                class="card-props mt-2"
              >
                <span class="card-prop-value">{{ stat.value }}</span>
                <span class="card-prop-label">{{ stat.label }}</span>
              </p>
            </div>
            <img
              :src="require(`~/assets/images/mode/icon/${mode.icon}`)"
              class="h-12 self-center mr-6 my-4"
            >
          </div>
        </div>

        <adsense
          v-if="ads"
          root-class="w-full md:w-1/2 mt-1 mx-auto"
          ins-class="mx-4 h-24"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="3933066188"
        />
        <div
          v-else
          class="w-full md:w-1/2 mt-3 mx-auto text-center leading-tight"
        >
          <div class="flex flex-wrap justify-center items-center md:mx-4 md:h-20 py-2 px-2 bg-primary-darker rounded border-2 border-secondary-lighter">
            <p class="text-xl italic">
              This site runs on Gems...
            </p>
            <p>
              Support me
              <a class="link" href="https://paypal.me/schneefux">on PayPal</a>
              and help me unlock Crow?
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <adsense
        v-if="ads"
        root-class="w-full mt-6 mx-auto"
        ins-class="h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1752268168"
      />
    </div>

    <div class="section-heading flex flex-wrap items-center">
      <h2 class="text-2xl font-semibold">
        Latest Battles
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
      <div class="flex flex-wrap">
        <div
          v-for="battle in player.battles.slice(0, battlePage * battlePageSize)"
          :key="battle.timestamp"
          class="w-full md:w-1/2 xl:w-1/3 card-wrapper mx-auto"
        >
          <div
            class="h-full items-center card bg-center bg-cover flex flex-wrap justify-between"
            :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.5)), url(\'' + require(`~/assets/images/mode/background/${battle.mode.background}`) + '\')'"
          >
            <div class="card-content relative w-full">
              <span class="card-header text-white">
                {{ battle.mode.label }}
              </span>
              <span class="text-primary-lightest absolute right-0 top-0 text-right text-lg font-semibold">
                {{ battle.result }}
              </span>
              <span class="text-primary-lightest absolute right-0 bottom-0 text-right font-semibold">
                <!-- TODO temporary fix for crooked timestamps -->
                <template v-if="hoursSinceDate(battle.timestamp) - 9 == 0">
                  just now
                </template>
                <template v-else>
                  {{ hoursSinceDate(battle.timestamp) - 9 }}h ago
                </template>
              </span>
              <span
                v-if="battle.trophyChange !== undefined"
                class="text-primary-lightest absolute left-0 bottom-0 text-right font-semibold"
              >
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
              <div class="mb-6 card-props flex flex-wrap justify-center">
                <div
                  v-for="(team, index) in battle.teams"
                  :key="index"
                  :class="{ 'w-full': team.length > 1 }"
                  class="flex flex-wrap justify-center"
                >
                  <div
                    v-for="mate in team"
                    :key="mate.tag"
                    :class="{
                      'flex-col mt-2': battle.teams.length != 2,
                      'flex-col mt-4': index == 1 && battle.teams.length == 2,
                      'flex-col-reverse': index == 0 && battle.teams.length == 2,
                    }"
                    class="flex items-center mb-2"
                  >
                    <div
                      class="flex items-center rounded-r h-full mx-1"
                      style="background: rgba(0, 0, 0, 0.5)"
                      :class="{
                        'border-2 border-primary': mate.tag == player.tag,
                      }"
                    >
                      <img
                        :src="require(`~/assets/images/hero/icon/${mate.brawler}_optimized.png`)"
                        class="w-10"
                      >
                      <img
                        src="~/assets/images/icon/trophy_optimized.png"
                        class="w-4"
                      >
                      <span
                        class="w-8 sm:ml-1 text-secondary-lighter font-semibold flex"
                      >
                        {{ mate.brawlerTrophies }}
                      </span>
                      <span
                        v-if="mate.isBigbrawler"
                        class="text-lg w-8 text-center"
                      >
                        💀
                      </span>
                    </div>
                    <div
                      :class="{
                        'mb-1': index == 0 && battle.teams.length <= 2,
                      }"
                      class="w-full text-center"
                    >
                      <nuxt-link
                        class="text-xs whitespace-no-wrap"
                        rel="nofollow"
                        :to="`/player/${mate.tag}`"
                        :class="{
                          'link': mate.tag != player.tag,
                          'text-secondary': mate.tag == player.tag,
                        }"
                      >
                        {{ mate.name }}
                      </nuxt-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="battlePage * battlePageSize < player.battles.length"
        class="mt-2 w-full text-right"
      >
        <button
          class="button button-md"
          @click="battlePage++; $ga.event('battlelog', 'load_more', battlePage)"
        >
        Load More Battles
        </button>
      </div>
    </div>

    <div class="section">
      <adsense
        v-if="ads"
        root-class="w-full mt-6 mx-auto"
        ins-class="h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4129048243"
      />
    </div>

    <div class="section-heading">
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
          Tip: Use the Map Meta
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
          :to="`/meta/map/${tip.event.id}`"
          class="link inline-block"
        >
          {{ formatMode(tip.event.mode) }} - {{ tip.event.map }}
        </nuxt-link>.
      </p>
      <button
        v-if="tipsPage * tipsPageSize < eventRecommendations.length"
        class="mt-3 button button-sm"
        @click="tipsPage++; $ga.event('tips', 'load_more', tipsPage)"
      >
        Load More Tips
      </button>
      <button
        v-if="notificationsAllowed"
        class="ml-2 button button-sm"
        @click="notifyTips"
      >
        Send as Notification
      </button>
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <template v-for="brawler in brawlersAndAds">
          <div
            v-if="ads || brawler.adSlot === undefined"
            :key="brawler.id"
            class="card-wrapper w-full md:flex-1"
          >
            <adsense
              v-if="ads && brawler.adSlot !== undefined"
              v-show="ads"
              ins-class="h-32 md:min-w-80 mx-auto"
              data-ad-client="ca-pub-6856963757796636"
              :data-ad-slot="brawler.id"
            />

            <brawler-card
              v-if="brawler.adSlot === undefined"
              :title="brawler.name"
              :brawler="brawler.id"
            >
              <template v-slot:history>
                <div
                  v-if="brawler.history.length > 1"
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
        </template>
      </div>
    </div>

    <div
      v-if="relevantGuides.length > 0"
      class="section-heading"
    >
      <h2 class="text-2xl font-semibold">
        Recommended for you
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
import { induceAdsIntoBrawlers, formatMode, capitalizeWords } from '~/store/index'
import Blogroll from '~/components/blogroll'
import BrawlerCard from '~/components/brawler-card'

function scaleMinMax(values) {
  const min = Math.min.apply(Math, values)
  const max = Math.max.apply(Math, values)

  if (min === max) {
    return values.map(value => 0.5)
  }

  return values.map(value => (value - min) / (max - min))
}

function zip(arr1, arr2) {
  return arr1.map((value, index) => [value, arr2[index]])
}

function hoursSinceDate(date) {
  const then = Date.parse(date)
  const now = (new Date()).getTime()
  return Math.ceil((now - then) / 1000 / 3600)
}

export default {
  name: 'PlayerProfile',
  components: {
    Blogroll,
    BrawlerCard,
  },
  head() {
    const description = `Brawl Time for ${this.player.name}: ${Math.floor(this.player.hoursSpent)} hours spent, ${this.player.trophies} Trophies. Track progress and get recommendations for BrawlStars.`
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
      hoursSpent: 0,
      error: '',
      battlePage: 1,
      battlePageSize: 3,
      refreshSecondsLeft: 180,
      installPrompt: undefined,
      tipsPage: 1,
      tipsPageSize: 3,
      notificationsAllowed: false,
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
          value: this.hoursSpent / 4.27
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: 'toilet breaks',
          value: this.hoursSpent / (102 / 7 / 60)
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: 'books unread',
          value: this.hoursSpent / 7.72
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: 'songs unheard',
          value: this.hoursSpent / (3.7 / 60)
        },
      }
    },
    brawlersUnlocked() {
      return Object.keys(this.player.brawlers).length
    },
    trophiesPerHour() {
      if (this.hoursSpent === 0) {
        return 0
      }
      return this.player.trophies / this.hoursSpent
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
      const start = Date.parse(this.player.history[0].timestamp)
      const now = (new Date()).getTime()
      return Math.ceil((now - start) / 1000 / 3600 / 24)
    },
    daysSinceBrawlerHistoryStart() {
      const brawlersMin = {}
      Object.entries(this.player.brawlers).forEach(([brawlerId, brawler]) => {
        const start = Date.parse(brawler.history[0].timestamp)
        const now = (new Date()).getTime()
        brawlersMin[brawlerId] = Math.ceil((now - start) / 1000 / 3600 / 24)
      })
      return brawlersMin
    },
    relevantGuides() {
      // shuffle posts
      const posts = this.blog.guides.concat().sort(() => 0.5 - Math.random())
      return posts.slice(0, 3)
    },
    brawlersAndAds() {
      const adSlots = ['4939381313', '1491090899', '2180482263', '2451945008', '8597130071']
      const adFrequency = 9
      const brawlersKV = [...Object.entries(this.player.brawlers)]
      const brawlers = brawlersKV.map(([brawlerId, brawler]) => ({
        id: brawlerId,
        ...brawler
      }))
      return induceAdsIntoBrawlers(brawlers, adSlots, adFrequency)
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

        worstBrawlers.forEach((brawler) => {
          if (!(event.id in this.bestBrawlersByMap)) {
            return
          }
          const bestBrawlers = this.bestBrawlersByMap[event.id]
          const rankIndex = bestBrawlers.findIndex(b => b.name.toLowerCase() === brawler.name.toLowerCase())
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
    ...mapState({
      ads: state => state.adsEnabled,
      blog: state => state.blog,
      player: state => state.player,
      totalBrawlers: state => state.totalBrawlers,
      currentEvents: state => state.currentEvents,
      installBannerDismissed: state => state.installBannerDismissed,
    }),
    ...mapGetters({
      rank: 'playerRank',
      bestBrawlersByMap: 'bestBrawlersByMap',
    }),
  },
  async fetch({ store, params }) {
    if (!process.static) {
      await store.dispatch('loadLeaderboard')
      await store.dispatch('loadCurrentMeta')
    }
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
    if (process.client) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.installPrompt = e
      })

      this.notificationsAllowed = Notification.permission !== 'denied'
    }
    if (process.static) {
      this.loadLeaderboard()
      this.loadCurrentMeta()
    }
  },
  mounted() {
    if (process.client) {
      const playerHours = this.player.hoursSpent
      const animationDuration = 5000
      const frameDuration = 100
      const k = Math.log(playerHours) / (animationDuration / frameDuration)

      this.hoursSpent = 0
      const hoursTimer = () => setTimeout(() => {
        this.hoursSpent += k * (playerHours - this.hoursSpent)
        if (Math.floor(this.hoursSpent) < playerHours) {
          hoursTimer()
        } else {
          this.hoursSpent = playerHours
        }
      }, frameDuration)
      hoursTimer()
    }

    if (process.static) {
      this.loadLeaderboard()
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
      this.installPrompt = undefined
      this.dismissInstallBanner()
    },
    async install() {
      this.$ga.event('app', 'click', 'install_banner')
      this.installPrompt.prompt()
      const choice = await this.installPrompt.userChoice
      this.$ga.event('app', 'prompt', choice.outcome)
      this.installPrompt = undefined
    },
    async notifyTips() {
      if (!(Notification.permission in ['denied', 'granted'])) {
        await Notification.requestPermission()
      }

      if (Notification.permission === 'granted') {
        this.$ga.event('profile', 'send_notification', 'tips')
        this.notificationsAllowed = true

        const sw = await navigator.serviceWorker.ready

        const tips = this.eventRecommendations
        sw.showNotification(`Tips for ${this.player.name} by Brawl Time Ninja`, {
          body: tips.map(tip =>
            `Play ${capitalizeWords(tip.brawler.name.toLowerCase())} in ${tip.event.mode} - ${tip.event.map}`
          ).join('\n'),
        })
      } else {
        this.notificationsAllowed = false
      }
    },
    ...mapMutations({
      dismissInstallBanner: 'dismissInstallBanner',
    }),
    ...mapActions({
      refreshPlayer: 'refreshPlayer',
      loadLeaderboard: 'loadLeaderboard',
      loadCurrentMeta: 'loadCurrentMeta',
    }),
  },
}
</script>

<style scoped>
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
</style>
