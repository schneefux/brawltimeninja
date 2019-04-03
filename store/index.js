const app = process.env.app

export const state = () => ({
  app,
  labels: {
    appTitle: 'Online',
    disclaimer: '',
    backgroundMobile: '',
    backgroundDesktop: '',
  },
  shards: [],
  featuredPlayers: [],
  lastPlayers: [],
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
  addLastPlayer(state, player) {
    const existsIn = arr => arr.some(({ id }) => player.id === id)

    if (existsIn(state.lastPlayers)) {
      return
    }
    if (existsIn(state.featuredPlayers)) {
      return
    }

    state.lastPlayers = [player, ...state.lastPlayers.slice(0, 4)]
  },
}

export const actions = {
  async loadLabels({ state, commit }) {
    if (state.labels.disclaimer.length > 0) {
      return
    }

    const labels = await this.$axios.$get(`/api/${state.app}/labels`)
    commit('setLabels', labels)
  },
  async loadShards({ state, commit }) {
    if (state.shards.length > 0) {
      // TODO brawlstars has 0
      return
    }

    const shards = await this.$axios.$get(`/api/${state.app}/shards`)
    commit('setShards', shards)
  },
  async loadFeaturedPlayers({ state, commit }) {
    if (state.featuredPlayers.length > 0) {
      return
    }

    const featuredPlayers = await this.$axios.$get(`/api/${state.app}/featured-players`)
    commit('setFeaturedPlayers', featuredPlayers)
  },
  async loadPlayer({ state, commit }) {
    if (state.player.loaded) {
      return
    }

    const player = await this.$axios.$get(`/api/${state.app}/player/${state.player.shard}/${state.player.id}`)
    commit('setPlayer', player)
    commit('addLastPlayer', player)
  },
}
