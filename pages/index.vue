<template>
  <div class="flex flex-col items-center">
    <div class="mt-10 text-center font-sans mx-2">
      <h1>How much time on {{ labels.appTitle }}?</h1>
    </div>

    <p class="mt-3 text-center text-lg mx-2">See how much you play, statistics for your {{ labels.heroes }} and more.</p>

    <div class="mt-4 mx-4">
      <form
        @submit.prevent="submitName"
        class="flex flex-wrap justify-center">
        <div class="text-center bg-primary rounded">
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
              class="w-40 md:w-48 tracking-wide font-black appearance-none text-grey-lighter bg-transparent border-none focus:outline-none ml-3 mr-2">
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

    <div class="mt-3 text-center" v-if="labels.nameHelpVideo">
      <details>
        <summary @click="loadNameHelpVideo = true">Need help?</summary>
        <iframe
          v-if="loadNameHelpVideo"
          class="mt-3"
          width="480"
          height="271"
          frameborder="0"
          allow="encrypted-media; picture-in-picture"
          :src="labels.nameHelpVideo + '&version=3&rel=0&fs=0&loop=1&playsinline=1'">
        </iframe>
      </details>
    </div>

    <div class="my-4 text-center max-w-sm">
      <p
        v-if="lastPlayers.length === 0"
        class="text-grey"
      >
        Or check one of these profiles:
      </p>
      <p v-else>
        Recently viewed:
      </p>
      <p class="mt-2 mx-auto">
        <router-link
          v-for="player in (lastPlayers.length === 0 ? featuredPlayers : lastPlayers)"
          :key="player.id"
          :to="playerToRoute(player)"
          tag="button"
          class="ml-2 text-secondary border-primary border-b-2">
          {{ player.name }}
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

function playerToRoute(player) {
  return {
    name: 'player-shard-name',
    params: {
      name: player.id,
      shard: player.shard,
    }
  }
}

export default {
  data() {
    return {
      name: undefined,
      nameLoading: false,
      nameNotFound: false,
      loadNameHelpVideo: false,
      playerToRoute,
    }
  },
  computed: {
    playerRoute() {
      return playerToRoute({ id: this.name, shard: this.shard })
    },
    nameRegex() {
      return new RegExp(this.labels.nameRegex)
    },
    ...mapState({
      labels: state => state.labels,
      lastPlayers: state => state.lastPlayers,
      featuredPlayers: state => state.featuredPlayers,
      shards: state => state.shards,
    }),
  },
  async asyncData({ store }) {
    await store.dispatch('loadShards')
    const shards = store.state.shards

    return {
      shard: shards.length > 0 ? shards[0].id : 'global',
    }
  },
  async fetch({ store }) {
    await Promise.all([
      store.dispatch('loadLabels'),
      store.dispatch('loadFeaturedPlayers'),
    ])
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
        this.setPlayerId({
          id: this.name,
          shard: this.shard,
        })
        await this.loadPlayer()
      } catch (error) {
        this.nameNotFound = true
        return
      } finally {
        this.nameLoading = false
      }

      this.$router.push(this.playerRoute)
    },
    ...mapMutations({
      setPlayerId: 'setPlayerId',
    }),
    ...mapActions({
      loadPlayer: 'loadPlayer',
    }),
  },
}
</script>
