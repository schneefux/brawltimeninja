import { exception } from 'vue-analytics'
import payload from './payload.json'

export function induceAdsIntoBrawlers(brawlers, adSlots, adFrequency) {
  return brawlers.reduce((agg, brawler, index, self) => {
    if (index === self.length - 1) {
      const ad = { id: adSlots[index / adFrequency + 1] }
      return agg.concat(brawler, ad)
    }

    if (index % adFrequency === 0) {
      const ad = { id: adSlots[index / adFrequency] }
      return agg.concat(ad, brawler)
    }

    return agg.concat(brawler)
  }, [])
}

export const state = () => ({
  version: undefined,
  // fill the store from the payload in static build
  blog: payload.blog,
  featuredPlayers: payload.featuredPlayers,
  tagPattern: '^[0289PYLQGRJCUV]{3,}$',
  lastPlayers: [],
  player: {
    tag: '',
    modes: [],
    heroes: [],
  },
  playerLoaded: false,
  currentEvents: [],
  currentEventsLoaded: false,
  leaderboard: [],
  leaderboardLoaded: false,
  meta: [],
  metaLoaded: false,
  cookiesAllowed: false,
  adsAllowed: false,
})

export const getters = {
  guidesForCurrentEvents(state) {
    const guides = state.blog.guides
    const events = state.currentEvents
    const matchesAnyEvent = ({ map }) => events.includes(map)
    return guides.filter(matchesAnyEvent)
  },
  playerRank(state) {
    if (!state.playerLoaded || !state.leaderboardLoaded) {
      return 0
    }

    return state.leaderboard
      .map(({ tag }) => tag)
      .indexOf(state.player.tag) + 1
  },
  metaStatMaps(state) {
    return {
      labels: {
        trophies: 'Trophies',
        spTrophies: 'with Star Power',
        trophyChange: 'since 7d ago',
      },
      icons: {
        trophies: 'trophy',
        spTrophies: 'starpower',
        trophyChange: 'trophy', // TODO
      },
      formatters: {
        trophies: n => Math.round(n),
        spTrophies: n => Math.round(n),
        trophyChange: n => n <= 0 ? Math.round(n) : `+${Math.round(n)}`,
      },
    }
  },
  topBrawlers(state, getters) {
    const props = Object.keys(getters.metaStatMaps.labels)
    const max = {}

    state.meta.forEach((entry) => {
      props.forEach((prop) => {
        if (!(prop in max) || max[prop][prop] < entry[prop]) {
          max[prop] = entry
        }
      })
    })

    return max
  },
}

export const mutations = {
  setBlog(state, blog) {
    state.blog = blog
  },
  setFeaturedPlayers(state, featuredPlayers) {
    state.featuredPlayers = featuredPlayers
  },
  setPlayerTag(state, tag) {
    if (state.player.tag === tag) {
      return
    }

    this._vm.$set(state.player, 'tag', tag)
    state.playerLoaded = false
  },
  setPlayer(state, player) {
    state.player = player
    state.playerLoaded = true
  },
  addLastPlayer(state, player) {
    if (state.lastPlayers.some(({ tag }) => player.tag === tag)) {
      return
    }
    const clone = obj => JSON.parse(JSON.stringify(obj))

    state.lastPlayers = [clone(player), ...state.lastPlayers.slice(0, 4)]
  },
  setCurrentEvents(state, currentEvents) {
    state.currentEvents = currentEvents
    state.currentEventsLoaded = true
  },
  setLeaderboard(state, leaderboard) {
    state.leaderboard = leaderboard
    state.leaderboardLoaded = true
  },
  setMeta(state, meta) {
    state.meta = meta
    state.metaLoaded = true
  },
  allowAds(state) {
    state.adsAllowed = true
  },
  allowCookies(state) {
    state.cookiesAllowed = true
  },
  clearCookieSettings(state) {
    state.adsAllowed = false
    state.cookiesAllowed = false
  },
}

export const actions = {
  async nuxtServerInit({ commit }) {
    if (process.static) {
      return
    }

    // overwrite generated (possibly empty) payload
    // with current API data when running on server
    const blog = await this.$axios.$get('/api/blog')
    const featuredPlayers = await this.$axios.$get('/api/featured-players')

    commit('setFeaturedPlayers', featuredPlayers)
    commit('setBlog', blog)
  },
  async refreshPlayer({ state, commit }) {
    const player = await this.$axios.$get(`/api/player/${state.player.tag}`)
    commit('setPlayer', player)
  },
  async loadPlayer({ state, commit }) {
    if (state.playerLoaded) {
      return
    }

    const player = await this.$axios.$get(`/api/player/${state.player.tag}`)
    commit('setPlayer', player)
    commit('addLastPlayer', player)
  },
  async loadCurrentEvents({ state, commit }) {
    if (state.currentEventsLoaded) {
      return
    }

    try {
      const currentEvents = await this.$axios.$get('/api/current-events')
      commit('setCurrentEvents', currentEvents)
    } catch (error) {
      // not critical, ignore
      exception('cannot get events: ' + error.message)
      console.error('cannot get current events:', error.message)
    }
  },
  async loadLeaderboard({ state, commit }) {
    if (state.leaderboardLoaded) {
      return
    }

    try {
      const leaderboard = await this.$axios.$get('/api/leaderboard/hours')
      commit('setLeaderboard', leaderboard)
    } catch (error) {
      // not critical, ignore
      exception('cannot get leaderboard: ' + error.message)
      console.error('cannot get leaderboard:', error.message)
    }
  },
  async loadMeta({ state, commit }) {
    if (state.metaLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta')
      commit('setMeta', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get meta: ' + error.message)
      console.error('cannot get meta:', error.message)
    }
  },
}
