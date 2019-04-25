import payload from './payload.json'

export const state = () => ({
  // fill the store from the payload in static build
  blog: payload.blog,
  featuredPlayers: payload.featuredPlayers,
  lastPlayers: [],
  player: {
    id: '',
    modes: [],
    heroes: [],
  },
  playerLoaded: false,
  currentEvents: [],
  currentEventsLoaded: false,
})

export const getters = {
  guidesForCurrentEvents(state) {
    const guides = state.blog.guides
    const events = state.currentEvents
    const matchesAnyEvent = ({ map }) => events.includes(map)
    return guides.filter(matchesAnyEvent)
  },
}

export const mutations = {
  setBlog(state, blog) {
    state.blog = blog
  },
  setFeaturedPlayers(state, featuredPlayers) {
    state.featuredPlayers = featuredPlayers
  },
  setPlayerId(state, { id }) {
    if (state.player.id === id) {
      return
    }

    this._vm.$set(state.player, 'id', id)
    state.playerLoaded = false
  },
  setPlayer(state, player) {
    state.player = player
    state.playerLoaded = true
  },
  addLastPlayer(state, player) {
    if (state.lastPlayers.some(({ id }) => player.id === id)) {
      return
    }

    state.lastPlayers = [player, ...state.lastPlayers.slice(0, 4)]
  },
  setCurrentEvents(state, currentEvents) {
    state.currentEvents = currentEvents
    state.currentEventsLoaded = true
  },
}

export const actions = {
  async nuxtServerInit({ commit }) {
    // overwrite generated (possibly empty) payload
    // with current API data when running on server
    const blog = await this.$axios.$get('/api/blog')
    const featuredPlayers = await this.$axios.$get('/api/featured-players')

    commit('setFeaturedPlayers', featuredPlayers)
    commit('setBlog', blog)
  },
  async loadPlayer({ state, commit }) {
    if (state.playerLoaded) {
      return
    }

    const player = await this.$axios.$get(`/api/player/${state.player.id}`)
    commit('setPlayer', player)
    commit('addLastPlayer', player)
  },
  async loadCurrentEvents({ state, commit }) {
    if (state.currentEventsLoaded) {
      return
    }

    const currentEvents = await this.$axios.$get('/api/current-events')
    commit('setCurrentEvents', currentEvents)
  },
}
