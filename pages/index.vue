<template>
  <div class="flex flex-col items-center">
    <div class="text-center font-sans">
      <h1>How much time on {{ labels.appTitle }}?</h1>
    </div>

    <div class="my-6 mx-4">
      <form class="flex items-center py-2 border-2 rounded-lg border-primary-dark">
        <input id="userid" v-model="userid" type="text" placeholder="Enter your tag" class="w-48 tracking-wide font-black appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2">
        <router-link tag="button" :to="playerRoute" class="text-black font-semibold flex-no-shrink bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 mr-3 rounded" type="button">
          Search
        </router-link>
      </form>
    </div>

    <div class="my-2 text-center">
      <p class="text-grey">Or check one of these profiles:</p>
      <p class="mt-2">
        <router-link
          v-for="player in demoPlayers"
          :key="player.tag"
          tag="button"
          :to="{ name: 'player-userid', params: { userid: player.tag } }"
          class="ml-2 text-secondary border-primary border-b-2 rounded">
          {{ player.name }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userid: undefined
    }
  },
  computed: {
    playerRoute() {
      return {
        name: 'player-userid',
        params: {
          userid: this.userid
        }
      }
    }
  },
  async asyncData({ $axios, env }) {
    const demoPlayers = await $axios.$get(`/api/${env.app}/featured-players`)
    const labels = await $axios.$get(`/api/${env.app}/labels`)
    return {
      demoPlayers,
      labels,
    }
  },
}
</script>
