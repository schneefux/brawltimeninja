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
          which equals to
        </p>

        <div class="flex flex-wrap justify-between">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto px-1 md:mx-1 my-3">
            <p class="text-3xl text-secondary font-bold">{{ stat.value }}</p>
            <p class="text-2xl text-grey-lighter">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="section" v-if="player.stats">
      <player-statistics :stats="player.stats" />
    </div>

    <div class="my-4 text-center">
      <adsense
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="9335862290">
      </adsense>
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
              <div class="card-header">{{ mode.label }}</div>
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
      </div>
    </div>

    <div class="my-4 text-center">
      <adsense
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4606279792">
      </adsense>
    </div>

    <div class="section-heading">
      <h2>Brawlers</h2>
    </div>

    <div class="section">
      <player-statistics :stats="player.heroStats" />
    </div>

    <div class="section">
      <div class="flex flex-wrap justify-between">
        <div
          class="card-wrapper w-full md:w-auto"
          v-for="(hero, heroId) in player.heroes"
          :key="heroId">
          <div
            class="card bg-primary-dark flex">
            <div class="flex flex-col w-32 justify-between">
              <span class="font-bold text-white text-2xl text-shadow py-2 px-3">{{ hero.label }}</span>
              <img :src="hero.icon" class="w-24">
            </div>
            <div class="py-2 px-4 flex-grow w-48 self-center flex justify-end">
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
      </div>
    </div>

    <div class="my-4 text-center">
      <adsense
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="7563615625">
      </adsense>
    </div>
  </div>
</template>

<script>
import PlayerStatistics from '~/components/player-statistics'
import { mapState } from 'vuex'

export default {
  name: 'ProfilePage',
  components: {
    PlayerStatistics,
  },
  data() {
    return {
      heroHighlightIndex: 0,
      hoursSpent: 0,
      kwhSpent: 0,
      toiletBreaks: 0,
      pizzaKg: 0,
      error: ''
    }
  },
  computed: {
    heroHighlight() {
      return this.player.heroes[this.heroHighlightKey]
    },
    heroHighlightKey() {
      return Object.keys(this.player.heroes)[this.heroHighlightIndex]
    },
    funStats() {
      return {
        kwh: {
          // https://www.quora.com/How-many-watts-an-hour-does-a-phone-use
          label: 'kWh battery used',
          value: Math.floor(this.hoursSpent * 2.5)
        },
        toiletBreaks: {
          // https://www.bladderandbowel.org/bladder/bladder-conditions-and-symptoms/frequency/
          label: 'toilet breaks taken',
          value: Math.floor(this.hoursSpent / 7)
        },
      }
    },
    ...mapState({
      player: state => state.player,
    }),
  },
  async fetch({ store, params }) {
    store.commit('setPlayerId', {
      id: params.name,
    })
    await store.dispatch('loadPlayer')
  },
  mounted() {
    const highlightTimer = () => setTimeout(() => {
      this.nextHighlight()
      highlightTimer()
    }, 5000)
    highlightTimer()

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
  },
  methods: {
    nextHighlight() {
      const heroes = Object.keys(this.player.heroes)
      if (this.heroHighlightIndex === heroes.length - 1) {
        this.heroHighlightIndex = 0
      } else {
        this.heroHighlightIndex += 1
      }
    },
  },
}
</script>

<style>
.card-wrapper {
  @apply my-3;
}
@screen md {
  .card-wrapper {
    @apply px-4;
  }
}

.card {
  @apply rounded overflow-hidden shadow-lg;
}

.card-content {
  @apply mx-6 my-4;
}

.card-header {
  @apply font-semibold text-xl text-white;
}

.card-props {
  @apply mt-2 text-grey-lighter;
}

.card-prop-icon {
  @apply h-5 align-middle mr-1;
}

.card-prop-value {
  @apply font-medium;
}

.section-heading {
  @apply font-sans mt-8;
}

.section {
  @apply mt-4;
}
@screen md {
  .section {
    @apply mx-8;
  }
}
</style>
