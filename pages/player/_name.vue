<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1>Statistics for <span class="text-secondary">{{ player.name }}</span></h1>
    </div>

    <div class="section leading-tight text-center">
      <div class="section items-center justify-center flex flex-wrap">
        <div class="mx-auto md:mx-0">
          <p class="text-5xl text-secondary font-bold">
            {{ Math.floor(hoursSpent) }}
          </p>
          <p class="text-3xl text-white">
            hours spent
          </p>
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
            <p class="text-3xl text-secondary font-bold">
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
          <div class="bigstat-left text-4xl">
            <div class="" style="margin-top: -0.125em">
              [
            </div>
            <div class="mx-2 text-primary-light font-bold">
              {{ player.clubName }}
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
          <div class="bigstat-left bigstat-number">
            {{ player.trophies.toLocaleString() }}
          </div>
          <div class="bigstat-right bigstat-label text-3xl">
            Trophies
          </div>
        </div>

        <div class="bigstat-container">
          <div class="bigstat-left bigstat-number">
            {{ Math.floor(trophiesPerHour) }}
          </div>
          <div class="bigstat-right bigstat-label text-xl">
            Trophies per&nbsp;hour
          </div>
        </div>
      </div>
    </div>

    <div class="section-heading">
      <h2>Game Modes</h2>
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
          v-show="ads"
          root-class="w-full md:w-1/2 mt-1 mx-auto"
          ins-class="mx-4 h-24"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="3933066188"
        />
      </div>
    </div>

    <div class="section-heading">
      <h2>Brawlers</h2>
    </div>

    <div class="section leading-tight md:mx-4 flex flex-wrap py-4 px-6">
      <p
        v-for="(stat, heroName) in player.heroStats"
        :key="heroName"
        class="md:text-center text-xl font-semibold my-1 w-full md:w-auto md:mx-auto"
      >
        <span class="md:block md:text-2xl">{{ stat.label }}</span>
        <span class="md:block float-right md:float-none text-primary-lighter md:mt-1">{{ stat.value }}</span>
      </p>
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <adsense
          v-show="ads"
          root-class="w-full md:w-80 my-2 md:mx-4"
          ins-class="h-32"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="4939381313"
        />

        <div
          v-for="(hero, heroId) in player.heroes"
          :key="heroId"
          class="card-wrapper w-full md:w-auto"
        >
          <div class="card bg-primary-dark flex h-full">
            <div class="flex flex-col w-32 justify-between">
              <span class="font-bold text-white text-2xl text-shadow py-2 px-3">{{ hero.label }}</span>
              <img
                :src="require(`~/assets/images/hero/icon/${heroId}_optimized.png`)"
                class="w-24"
              >
            </div>
            <div class="py-2 pl-2 pr-4 flex-grow w-48 self-center flex justify-end">
              <table>
                <tr
                  v-for="(stat, statName) in hero.stats"
                  :key="statName"
                  class="card-props"
                >
                  <td class="text-center">
                    <img
                      :src="require(`~/assets/images/icon/${stat.icon}`)"
                      class="card-prop-icon"
                    >
                  </td>
                  <td class="card-prop-value text-right pr-1">
                    {{ stat.value }}
                  </td>
                  <td class="card-prop-label">
                    {{ stat.label }}
                  </td>
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
          data-ad-slot="1491090899"
        />
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
        :posts="relevantGuides"
        topic="guides"
      />
    </div>
  </div>
</template>

<script>
import Blogroll from '~/components/blogroll'
import { mapState } from 'vuex'

export default {
  name: 'ProfilePage',
  components: {
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
    trophiesPerHour() {
      if (this.hoursSpent === 0) {
        return 0
      }
      return this.player.trophies / this.hoursSpent
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
    const playerHours = this.player.hoursSpent
    const animationDuration = 5000
    const frameDuration = 15
    const k = Math.log(playerHours) / (animationDuration / frameDuration)

    this.hoursSpent = 0
    const hoursTimer = () => setTimeout(() => {
      this.hoursSpent += k * (playerHours - this.hoursSpent)
      if (Math.floor(this.hoursSpent) < playerHours) {
        hoursTimer()
      }
    }, frameDuration)
    hoursTimer()

    if (global.window !== undefined) {
      const checkAdblock = () => {
        this.ads = global.adsbygoogle.loaded === true
      }

      if (global.document.readyState === 'complete') {
        setTimeout(checkAdblock, animationDuration) // TODO make this smarter
      } else {
        global.window.addEventListener('load', checkAdblock)
      }
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

.bigstat-container {
  @apply flex justify-center items-center mt-2 w-full;
}

@screen md {
  .bigstat-container {
    @apply mx-6 w-auto;
  }
}

.bigstat-left {
  @apply w-1/2 text-right flex justify-end items-center mr-2;
}

.bigstat-right {
  @apply w-1/2 text-left flex justify-start items-center ml-2;
}

.bigstat-label {
  @apply leading-none text-white;
}

.bigstat-number {
  @apply text-5xl font-bold text-secondary;
}
</style>
