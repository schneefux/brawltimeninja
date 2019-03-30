<template>
  <div class="flex flex-col items-center">
    <div class="text-center font-sans">
      <h1>How much time on {{ labels.appTitle }}?</h1>
    </div>

    <div class="mt-8 mx-4">
      <form
        @submit.prevent="submitName"
        class="flex flex-wrap justify-center">
        <div class="text-center w-3/4 md:w-auto bg-primary rounded">
          <button
            v-for="(shardOption) in shards"
            :key="shardOption.id"
            @click="shard = shardOption.id"
            type="button"
            name="shard"
            :class="['py-1 px-3 border rounded border-primary whitespace-no-wrap font-medium w-1/2 md:w-auto', {
              'bg-primary-light': shard == shardOption.id,
              'bg-primary-darker text-grey-lighter hover:bg-primary-light hover:text-black': shard != shardOption.id,
            }]">
            {{ shardOption.label }}
          </button>
        </div>
        <div class="w-full flex justify-center">
          <div class="mt-3 py-2 border-2 rounded-lg border-primary-dark">
            <input
              v-model="name"
              :placeholder="`Enter your ${labels.userId}`"
              type="text"
              class="w-48 tracking-wide font-black appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2">
            <input
              type="submit"
              class="text-black font-semibold flex-no-shrink bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 mr-3 rounded"
              value="Search">
          </div>
        </div>
        <p class="mt-2 text-red-lighter" v-if="nameLoading">
          Searching…
        </p>
        <p class="mt-2 text-red-lighter" v-if="nameNotFound">
          Not found, please check again
        </p>
      </form>
    </div>

    <div class="my-6 text-center">
      <p class="text-grey">Or check one of these profiles:</p>
      <p class="mt-2">
        <router-link
          v-for="player in featuredPlayers"
          :key="player.id"
          :to="playerToRoute(player)"
          tag="button"
          class="ml-2 text-secondary border-primary border-b-2 rounded">
          {{ player.name }}
        </router-link>
      </p>
    </div>

    <div class="absolute pin-b mb-24">
      <adsense
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4384684878">
      </adsense>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: undefined,
      nameLoading: false,
      nameNotFound: false,
    }
  },
  computed: {
    playerRoute() {
      return {
        name: 'player-shard-name',
        params: {
          name: this.name,
          shard: this.shard,
        }
      }
    },
    playerToRoute() {
      return (player) => {
        return {
          name: 'player-shard-name',
          params: {
            name: player.id,
            shard: player.shard,
          }
        }
      }
    },
  },
  methods: {
    async submitName() {
      this.nameNotFound = false

      if (!this.nameRegex.test(this.name)) {
        this.nameNotFound = true
        return
      }

      try {
        this.nameLoading = true
        await this.$axios.$get(`/api/${this.app}/player/${this.shard}/${this.name}`)
      } catch (error) {
        this.nameNotFound = true
        return
      } finally {
        this.nameLoading = false
      }

      this.$router.push(this.playerRoute)
    },
  },
  async asyncData({ $axios, env }) {
    const app = env.app
    const featuredPlayers = await $axios.$get(`/api/${app}/featured-players`)
    const nameRegex = await $axios.$get(`/api/${app}/name-regex`)
    const shards = await $axios.$get(`/api/${app}/shards`)
    const labels = await $axios.$get(`/api/${app}/labels`)
    return {
      featuredPlayers,
      nameRegex: new RegExp(nameRegex),
      app,
      shards,
      labels,
      shard: shards.length > 0 ? shards[0].id : 'global',
    }
  },
}
</script>
