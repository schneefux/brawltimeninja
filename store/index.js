const app = process.env.app

export const state = () => ({
  labels: {
    appTitle: 'Online',
    disclaimer: '',
    backgroundMobile: '',
    backgroundDesktop: '',
  },
  shards: [],
  featuredPlayers: [],
  player: {
    loaded: false,
    id: '',
    shard: '',
    modes: [],
    heroes: [],
  },
})

export const mutations = {
  setLabels(state, labels) {
    state.labels = labels
  },
  setShards(state, shards) {
    state.shards = shards
  },
  setFeaturedPlayers(state, featuredPlayers) {
    state.featuredPlayers = featuredPlayers
  },
  setPlayerId(state, { id, shard }) {
    if (state.player.id === id && state.player.shard === shard) {
      return
    }

    this._vm.$set(state.player, 'id', id)
    this._vm.$set(state.player, 'shard', shard)
    this._vm.$set(state.player, 'loaded', false)
  },
  setPlayer(state, player) {
    state.player = {
      ...player,
      loaded: true,
    }
  },
}

export const actions = {
  async loadLabels({ state, commit }) {
    if (state.labels.disclaimer.length > 0) {
      return
    }

    const labels = await this.$axios.$get(`/api/${app}/labels`)
    commit('setLabels', labels)
  },
  async loadShards({ state, commit }) {
    if (state.shards.length > 0) {
      // TODO brawlstars has 0
      return
    }

    const shards = await this.$axios.$get(`/api/${app}/shards`)
    commit('setShards', shards)
  },
  async loadFeaturedPlayers({ state, commit }) {
    if (state.featuredPlayers.length > 0) {
      return
    }

    const featuredPlayers = await this.$axios.$get(`/api/${app}/featured-players`)
    commit('setFeaturedPlayers', featuredPlayers)
  },
  async loadPlayer({ state, commit }) {
    if (state.player.loaded) {
      return
    }

    const player = await this.$axios.$get(`/api/${app}/player/${state.player.shard}/${state.player.id}`)
    commit('setPlayer', player)
  },
}
