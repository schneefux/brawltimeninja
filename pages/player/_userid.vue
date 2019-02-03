<template>
  <div class="container mx-auto p-4">
    <div class="font-sans">
      <h1>Statistics for <span class="text-yellow">{{ player.name }}</span></h1>
    </div>

    <div class="md:mx-6 my-6">
      <div class="mx-8 my-6 text-center items-center justify-between flex flex-wrap">
        <div class="mx-auto md:mx-0 my-2">
          <p class="text-5xl text-yellow font-bold">{{ hoursSpent }}</p>
          <p class="text-3xl text-white">hours spent</p>
        </div>

        <p class="w-full md:w-auto text-xl my-1 mx-auto">
          which equals to
        </p>

        <div class="flex flex-wrap justify-between">
          <div
            v-for="(stat, statName) in funStats"
            :key="statName"
            class="mx-auto md:mx-2 my-2">
            <p class="text-3xl text-yellow-light font-bold">{{ stat.value }}</p>
            <p class="text-2xl text-grey-lighter">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="mx-8 flex flex-wrap">
        <p
          v-for="(stat, statName) in player.stats"
          :key="statName"
          class="text-xl my-1 w-full md:w-auto md:mx-auto">
          <span>{{ stat.label }}</span>
          <span class="text-blue-lighter float-right md:float-none">{{ stat.value }}</span>
        </p>
      </div>

      <div class="flex flex-wrap justify-center">
        <div class="flex-1 flex flex-wrap">
          <div
            class="w-full lg:w-1/2"
            v-for="(mode, modeName) in player.modes"
            :key="modeName">
            <div
              :style="`background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url('${mode.background}')`"
              class="card mx-auto md:mx-2 my-4 bg-center bg-cover flex flex-wrap justify-between">
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
                class="h-12 self-center mx-6 my-4"
                :src="mode.icon">
            </div>
          </div>
        </div>

        <div class="flex-0 w-full md:w-auto md:mx-4 my-4">
          <div
            :style="`background-image: url('${heroHighlight.icon}')`"
            class="card h-full flex flex-wrap md:flex-col justify-center bg-blue bg-contain bg-no-repeat bg-left-bottom">
            <span class="text-shadow md:text-shadow-0 flex-grow md:flex-initial card-header px-4 pt-4 pb-2 md:bg-blue">{{ heroHighlight.label }}</span>
            <div class="pl-2 pr-4 pb-2 mb-2 md:px-4 md:m-0 bg-blue-75 md:bg-blue rounded-bl md:rounded-none">
              <p
                v-for="(stat, statName) in heroHighlight.stats"
                :key="statName"
                class="card-props">
                <img class="card-prop-icon" :src="stat.icon">
                <span class="card-prop-value">{{ stat.value }}</span>
                <span class="card-prop-label">{{ stat.label }}</span>
              </p>
            </div>
            <div class="md:flex-grow"></div>
            <div class="w-48 md:w-24 my-2 mx-auto flex flex-wrap justify-center">
              <button
                v-for="(data, hero, index) in player.heroes"
                :key="hero"
                @click="heroHighlightIndex = index"
                class="p-1 mr-1 mb-1 hover:border-blue hover:bg-blue border-2 rounded-full"
                :class="{
                  'border-blue-darker bg-blue-darker': heroHighlightIndex == index,
                  'border-yellow-dark bg-yellow-dark': heroHighlightIndex != index,
                }"
                type="button"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
          label: 'kWh battery',
          value: Math.floor(this.hoursSpent * 2.5)
        },
        toiletBreaks: {
          // https://www.bladderandbowel.org/bladder/bladder-conditions-and-symptoms/frequency/
          label: 'toilet breaks',
          value: Math.floor(this.hoursSpent / 7)
        },
        pizzaKg: {
          // https://www.reference.com/food/much-large-pizza-weigh-7eb566c27f4ddc14
          // assuming a person eats every 6h
          label: 'kg pizza',
          value: Math.floor(this.hoursSpent / 6 * 0.500)
        },
        distanceWalked: {
          // assuming a person walks 7km/h
          label: 'km walked',
          value: Math.floor(this.hoursSpent / 7)
        }
      }
    }
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
  async asyncData({ params, $axios }) {
    const player = await $axios.$get('/api/brawlstars/player/' + params.userid)
    return {
      player,
      heroHighlightIndex: 0,
      hoursSpent: 0,
      kwhSpent: 0,
      toiletBreaks: 0,
      pizzaKg: 0,
      error: ''
    }
  },
  methods: {
    nextHighlight() {
      const heroes = Object.keys(this.player.heroes)
      if (this.heroHighlightIndex === heroes.length - 1) {
        this.heroHighlightIndex = 0
      } else {
        this.heroHighlightIndex += 1
      }
    }
  }
}
</script>

<style>
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
</style>
