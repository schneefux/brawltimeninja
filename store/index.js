export const state = () => ({
  blog: {},
  blogLoaded: false,
  featuredPlayers: [],
  lastPlayers: [],
  player: {
    loaded: false,
    id: '',
    modes: [],
    heroes: [],
  },
})

export const mutations = {
  setBlog(state, blog) {
    state.blog = blog
    state.blogLoaded = true
  },
  setFeaturedPlayers(state, featuredPlayers) {
    state.featuredPlayers = featuredPlayers
  },
  setPlayerId(state, { id }) {
    if (state.player.id === id) {
      return
    }

    this._vm.$set(state.player, 'id', id)
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
  async nuxtServerInit({ commit }, { payload }) {
    let blog
    let featuredPlayers

    if (payload !== undefined) {
      // fill the store so that nuxt generate does not
      // require an API connection for meta data
      blog = payload.blog
      featuredPlayers = payload.featuredPlayers
    } else {
      featuredPlayers = await this.$axios.$get(`/api/featured-players`)
      blog = await this.$axios.$get(`/api/blog`)
    }

    commit('setFeaturedPlayers', featuredPlayers)
    commit('setBlog', blog)
  },
  async loadPlayer({ state, commit }) {
    if (state.player.loaded) {
      return
    }

    const player = await this.$axios.$get(`/api/player/${state.player.id}`)
    commit('setPlayer', player)
    commit('addLastPlayer', player)
  },
}
