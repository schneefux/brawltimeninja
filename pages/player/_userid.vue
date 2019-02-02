<template>
  <div class="container mx-auto p-4">
    <div class="font-sans">
      <h1>Statistics for <span class="text-yellow">{{ player.name }}</span></h1>
    </div>

    <div class="md:mx-6 my-4 flex flex-wrap justify-center">
      <div class="flex-1 flex flex-wrap">
        <div
          class="w-full lg:w-1/2"
          v-for="(stats, mode) in player.modeStats"
          :key="mode">
          <div
            :style="`background-image: linear-gradient(135deg, rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.25)), url('${stats.background}')`"
            class="bg-center bg-cover md:mx-2 my-4 text-white max-w-sm flex flex-wrap justify-between card">
            <div class="card-content">
              <div class="font-bold text-xl mb-2">{{ stats.label }}</div>
              <p class="text-grey-lighter">
                {{ stats.victories }} victories
              </p>
            </div>
            <img
              class="h-12 self-center mx-6 my-4"
              :src="stats.icon">
          </div>
        </div>
      </div>

      <div class="flex-shrink w-full md:w-auto md:mx-4 my-4 text-grey-lightest">
        <div
          :style="`background-image: url('${heroHighlightStats.icon}')`"
          class="card h-full flex flex-wrap flex-col md:flex-row bg-blue bg-contain bg-no-repeat bg-right-bottom">
          <div class="card-content">
            <div class="font-bold text-xl">{{ heroHighlightStats.label }}</div>
            <p class="text-grey-lighter text-lg font-semibold mt-2 flex">
              <img class="h-5" src="/images/brawlstars/icons/trophy.png">
              <span class="ml-1">{{ heroHighlightStats.trophies }}</span>
            </p>
          </div>
          <div class="w-full self-center flex justify-center">
            <button
              v-for="(stats, hero) in player.heroStats"
              :key="hero"
              @click="heroHighlight = hero"
              class="m-1 hover:border-yellow-light border-8 rounded-full"
              :class="{
                'border-yellow-light': heroHighlight == hero,
                'border-yellow-dark': heroHighlight != hero,
              }"
              type="button"></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    const timer = () => setTimeout(() => {
      this.nextHighlight()
      timer()
    }, 5000)
    timer()
  },
  computed: {
    heroHighlightStats() {
      return this.player.heroStats[this.heroHighlight]
    }
  },
  async asyncData({ params, $axios }) {
    const player = await $axios.$get('/api/brawlstars/player/' + params.userid)
    return {
      player,
      heroHighlight: Object.keys(player.heroStats)[0],
      error: ''
    }
  },
  methods: {
    nextHighlight() {
      const heroes = Object.keys(this.player.heroStats)
      let index = heroes.indexOf(this.heroHighlight) + 1
      if (index >= heroes.length) {
        index = 0
      }
      this.heroHighlight = heroes[index]
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
</style>
