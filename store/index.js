const app = process.env.app

export const state = () => ({
  app,
  labels: {
    appTitle: 'Online',
    disclaimer: '',
    backgroundMobile: '',
    backgroundDesktop: '',
  },
  blog: {},
  shards: [],
  shardsLoaded: false,
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
  setBlog(state, blog) {
    state.blog = blog
  },
  setShards(state, shards) {
    state.shards = shards
    state.shardsLoaded = true
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
    if (state.lastPlayers.some(({ id }) => player.id === id)) {
      return
    }

    state.lastPlayers = [player, ...state.lastPlayers.slice(0, 4)]
  },
}

export const actions = {
  async nuxtServerInit({ commit, dispatch }, { payload }) {
    if (payload !== undefined) {
      // fill the store so that nuxt generate does not
      // require an API connection for meta data
      commit('setLabels', payload.labels)
      commit('setBlog', payload.blog)
      commit('setShards', payload.shards)
      commit('setFeaturedPlayers', payload.featuredPlayers)
    } else {
      await Promise.all([
        await dispatch('loadLabels'),
        await dispatch('loadBlog'),
        await dispatch('loadShards'),
        await dispatch('loadFeaturedPlayers'),
      ])
    }
  },
  async loadLabels({ state, commit }) {
    if (state.labels.disclaimer.length > 0) {
      return
    }

    const labels = await this.$axios.$get(`/api/${state.app}/labels`)
    commit('setLabels', labels)
  },
  async loadBlog({ state, commit }) {
    if (state.blog.loaded) {
      return
    }

    const blog = await this.$axios.$get(`/api/${state.app}/blog`)
    commit('setBlog', blog)
  },
  async loadShards({ state, commit }) {
    if (state.shardsLoaded) {
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
