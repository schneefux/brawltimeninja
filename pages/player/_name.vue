<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1>Statistics for <span class="text-secondary">{{ player.name }}</span></h1>
    </div>

    <div class="section">
      <div class="section text-center items-center justify-center flex flex-wrap">
        <div class="mx-auto md:mx-0">
          <p class="text-5xl text-secondary font-bold">{{ hoursSpent }}</p>
          <p class="text-3xl text-white">hours spent</p>
        </div>

        <p class="w-full md:w-auto text-xl my-4 mx-auto">
          which is about
        </p>

        <div class="flex flex-wrap justify-between">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto px-2 my-3">
            <p class="text-3xl text-secondary font-bold">{{ stat.value }}</p>
            <p class="text-2xl text-grey-lighter">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="player.stats">
      <player-statistics :stats="player.stats" />
    </div>

    <div class="section-heading">
      <h2>Game Modes</h2>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          class="w-full md:w-1/2 card-wrapper mx-auto"
          v-for="(mode, modeName) in player.modes"
          :key="modeName">
          <div
            :style="`background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url('${mode.background}')`"
            class="card bg-center bg-cover flex flex-wrap justify-between">
            <div class="card-content">
              <div class="card-header text-white">{{ mode.label }}</div>
              <p
                v-for="(stat, statName) in mode.stats"
                :key="statName"
                class="card-props mt-2">
                <span class="card-prop-value">{{ stat.value }}</span>
                <span class="card-prop-label">{{ stat.label }}</span>
              </p>
            </div>
            <img
              class="h-12 self-center mr-6 my-4"
              :src="mode.icon">
          </div>
        </div>

        <adsense
          v-show="ads"
          root-class="w-full md:w-1/2 mt-1 mx-auto"
          ins-class="mx-4 h-24"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="3933066188">
        </adsense>
      </div>
    </div>

    <div class="section-heading">
      <h2>Brawlers</h2>
    </div>

    <div class="section">
      <player-statistics :stats="player.heroStats" />
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <adsense
          v-show="ads"
          root-class="w-full md:w-80 my-2 md:mx-4"
          ins-class="h-32"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="4939381313">
        </adsense>

        <div
          class="card-wrapper w-full md:w-auto"
          v-for="(hero, heroId) in player.heroes"
          :key="heroId">
          <div
            class="card bg-primary-dark flex h-full">
            <div class="flex flex-col w-32 justify-between">
              <span class="font-bold text-white text-2xl text-shadow py-2 px-3">{{ hero.label }}</span>
              <img :src="hero.icon" class="w-24">
            </div>
            <div class="py-2 pl-2 pr-4 flex-grow w-48 self-center flex justify-end">
              <table>
                <tr
                  v-for="(stat, statName) in hero.stats"
                  :key="statName"
                  class="card-props">
                  <td class="text-center">
                    <img class="card-prop-icon" :src="stat.icon">
                  </td>
                  <td class="card-prop-value text-right pr-1">{{ stat.value }}</td>
                  <td class="card-prop-label">{{ stat.label }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <adsense
          v-show="ads"
          root-class="w-full md:w-80 my-2 md:mx-4"
          ins-class="h-32"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="1491090899">
        </adsense>
      </div>
    </div>

    <div
      v-show="relevantGuides.length > 0"
      class="section-heading"
    >
      <h2>Recommended for you</h2>
    </div>

    <div
      v-show="relevantGuides.length > 0"
      class="section"
    >
      <blogroll
        topic="guides"
        :posts="relevantGuides"
      ></blogroll>
    </div>
  </div>
</template>

<script>
import PlayerStatistics from '~/components/player-statistics'
import Blogroll from '~/components/blogroll'
import { mapState } from 'vuex'

export default {
  name: 'ProfilePage',
  components: {
    PlayerStatistics,
    Blogroll,
  },
  data() {
    return {
      hoursSpent: 0,
      error: '',
      ads: true,
    }
  },
  computed: {
    funStats() {
      return {
        recharges: {
          // measured with AccuBattery on my phone
          label: 'empty batteries',
          value: Math.floor(this.hoursSpent / 4.27)
        },
        toiletBreaks: {
          // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
          // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
          label: 'toilet breaks',
          value: Math.floor(this.hoursSpent / (102 / 7 / 60))
        },
        books: {
          // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
          label: 'books unread',
          value: Math.floor(this.hoursSpent / 7.72)
        },
        songs: {
          // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
          label: 'songs unheard',
          value: Math.floor(this.hoursSpent / (3.7 / 60))
        },
      }
    },
    relevantGuides() {
      // shuffle posts
      const posts = this.blog.guides.concat().sort(() => 0.5 - Math.random())
      return posts.slice(0, 3)
    },
    ...mapState({
      player: state => state.player,
      blog: state => state.blog,
    }),
  },
  async fetch({ store, params }) {
    store.commit('setPlayerId', {
      id: params.name,
    })
    await store.dispatch('loadPlayer')
  },
  mounted() {
    this.hoursSpent = 0
    const playerHours = Math.floor(this.player.minutesSpent / 60)
    const hoursTimer = () => setTimeout(() => {
      if (this.hoursSpent < playerHours * Math.random() * 10) {
        const step = Math.ceil(Math.sqrt(playerHours - this.hoursSpent))
        this.hoursSpent += step
      }
      if (this.hoursSpent < playerHours) {
        hoursTimer()
      }
    }, 50)
    hoursTimer()

    if (global.window !== undefined) {
      global.window.addEventListener('load', () => {
        this.ads = global.adsbygoogle.loaded === true
      })
    }
  },
}
</script>

<style>
.section {
  @apply mt-4;
}
@screen md {
  .section {
    @apply mx-8;
  }
}
</style>
