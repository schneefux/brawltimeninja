<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1 class="text-4xl font-semibold">
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
          v-if="player.clubName != ''"
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
              and help me unlock my first Legendary?
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

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Last Battles
      </h2>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          v-for="battle in player.battles.slice(0, battlePage * battlePageSize)"
          :key="battle.timestamp"
          class="w-full md:w-1/2 xl:w-1/3 card-wrapper mx-auto"
        >
          <div
            class="card bg-center bg-cover flex flex-wrap justify-between"
            :style="'background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.25)), url(\'' + require(`~/assets/images/mode/background/${battle.mode.background}`) + '\')'"
          >
            <div class="card-content relative">
              <span class="card-header text-white">
                {{ battle.mode.label }}
              </span>
              <span class="text-primary-lightest absolute right-0 top-0 text-right text-lg font-semibold">
                {{ battle.result }}
              </span>
              <span class="text-primary-lightest absolute right-0 bottom-0 text-right font-semibold">
                {{ hoursSinceDate(battle.timestamp) }}h ago
              </span>
              <div class="mb-6 card-props flex flex-wrap">
                <div
                  v-for="(team, index) in battle.teams"
                  :key="index"
                  class="w-full flex flex-wrap justify-center"
                >
                  <div
                    v-for="player in team"
                    :key="player.tag"
                    :class="{ 'flex-col': index == 1, 'flex-col-reverse': index == 0, 'mt-4': index == 1 }"
                    class="w-24 flex items-center mb-2"
                  >
                    <div
                      class="flex items-center rounded-r"
                      style="background: rgba(0, 0, 0, 0.5)"
                    >
                      <img
                        :src="require(`~/assets/images/hero/icon/${player.brawler}_optimized.png`)"
                        class="mx-auto self-center mr-1 h-8"
                      >
                      <span
                        class="text-secondary-lighter mx-1 w-8 font-semibold"
                      >
                        {{ player.brawlerTrophies }}
                      </span>
                    </div>
                    <div
                      :class="{ 'mt-1': index == 1, 'mb-1': index == 0 }"
                      class="w-full text-center"
                    >
                      <nuxt-link
                        class="text-xs link whitespace-no-wrap"
                        rel="nofollow"
                        :to="`/player/${player.tag}`"
                      >
                        {{ player.name }}
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
          class="text-black font-semibold flex-shrink-0 bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 rounded"
          @click="battlePage++"
        >
        Load More
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

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <template v-for="brawler in brawlersAndAds">
          <div
            v-if="ads || brawler.name !== undefined"
            :key="brawler.id"
            class="card-wrapper w-full md:flex-1"
          >
            <adsense
              v-if="ads && brawler.name === undefined"
              v-show="ads"
              root-class=""
              ins-class="h-32 md:min-w-80 mx-auto"
              data-ad-client="ca-pub-6856963757796636"
              :data-ad-slot="brawler.id"
            />

            <brawler-card
              v-if="brawler.name !== undefined"
              :id="brawler.id"
              :name="brawler.name"
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
import { mapState, mapGetters, mapActions } from 'vuex'
import { induceAdsIntoBrawlers } from '~/store/index'
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
    return {
      title: this.player.name,
    }
  },
  data() {
    return {
      hoursSpent: 0,
      error: '',
      totalBrawlers: 27,
      battlePage: 1,
      battlePageSize: 5,
      hoursSinceDate,
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
    ...mapState({
      ads: state => state.adsAllowed,
      blog: state => state.blog,
      player: state => state.player,
    }),
    ...mapGetters({
      rank: 'playerRank',
    }),
  },
  async fetch({ store, params }) {
    if (!process.static) {
      await store.dispatch('loadLeaderboard')
    }
  },
  async validate({ store, params }) {
    const { tag } = params
    const tagRegex = RegExp(store.state.tagPattern)

    if (!tagRegex.test(tag)) {
      return false
    }

    store.commit('setPlayerTag', tag)

    let lastError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await store.dispatch('loadPlayer')
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
    const playerHours = this.player.hoursSpent
    const animationDuration = 5000
    const frameDuration = 50
    const k = Math.log(playerHours) / (animationDuration / frameDuration)

    this.hoursSpent = 0
    const hoursTimer = () => setTimeout(() => {
      this.hoursSpent += k * (playerHours - this.hoursSpent)
      if (Math.floor(this.hoursSpent) < playerHours) {
        hoursTimer()
      }
    }, frameDuration)
    hoursTimer()

    if (process.static) {
      this.loadLeaderboard()
    }

    const refreshTimer = () => setTimeout(async () => {
      await this.refreshPlayer()
      refreshTimer()
    }, 5 * 60 * 1000)
    refreshTimer()
  },
  methods: {
    ...mapActions({
      refreshPlayer: 'refreshPlayer',
      loadLeaderboard: 'loadLeaderboard',
    }),
  },
}
</script>

<style scoped>
.section {
  @apply mt-4;
}
@screen md {
  .section {
    @apply mx-8;
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
</style>
