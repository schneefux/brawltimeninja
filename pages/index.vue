<template>
  <div class="flex flex-col items-center">
    <div class="text-center font-sans">
      <h1>How much time on {{ labels.appTitle }}?</h1>
    </div>

    <div class="mt-8 mx-4">
      <form class="flex flex-wrap justify-center">
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
            <input v-model="name" type="text" :placeholder="`Enter your ${labels.userId}`" class="w-48 tracking-wide font-black appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2">
            <router-link tag="button" :to="playerRoute" class="text-black font-semibold flex-no-shrink bg-secondary hover:bg-secondary-light border-secondary hover:border-secondary-light text-sm border-8 py-1 px-2 mr-3 rounded" type="button">
              Search
            </router-link>
          </div>
        </div>
      </form>
    </div>

    <div class="my-6 text-center">
      <p class="text-grey">Or check one of these profiles:</p>
      <p class="mt-2">
        <router-link
          v-for="player in demoPlayers"
          :key="player.id"
          tag="button"
          :to="{ name: 'player-shard-name', params: { name: player.id, shard: player.shard } }"
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
      name: undefined,
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
  },
  async asyncData({ $axios, env }) {
    const demoPlayers = await $axios.$get(`/api/${env.app}/featured-players`)
    const shards = await $axios.$get(`/api/${env.app}/shards`)
    const labels = await $axios.$get(`/api/${env.app}/labels`)
    return {
      demoPlayers,
      shards,
      labels,
      shard: shards.length > 0 ? shards[0].id : 'global',
    }
  },
}
</script>
