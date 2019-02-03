<template>
  <div class="container mx-auto p-4">
    <div class="font-sans">
      <h1>Statistics for <span class="text-yellow">{{ player.name }}</span></h1>
    </div>

    <div class="md:mx-6 my-6">
      <div class="mx-8 flex flex-wrap">
        <h2
          v-for="(stat, statName) in player.stats"
          :key="statName"
          class="my-1 w-full md:w-auto md:mx-auto border-blue border-0 rounded">
          <span>{{ stat.label }}</span>
          <span class="text-blue-lighter float-right md:float-none">{{ stat.value }}</span>
        </h2>
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
    }
  },
  mounted() {
    const timer = () => setTimeout(() => {
      this.nextHighlight()
      timer()
    }, 5000)
    timer()
  },
  async asyncData({ params, $axios }) {
    const player = await $axios.$get('/api/brawlstars/player/' + params.userid)
    return {
      player,
      heroHighlightIndex: 0,
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
