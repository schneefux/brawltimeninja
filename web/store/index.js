import { exception, event } from 'vue-analytics'
import payload from './payload.json'
import { metaStatMaps, getBestByEvent } from '~/lib/util'

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
  currentEvents: [],
  currentEventsLoaded: false,
  upcomingEvents: [],
  upcomingEventsLoaded: false,
  leaderboard: [],
  leaderboardLoaded: false,
  brawlerMeta: [],
  brawlerMetaLoaded: false,
  mapMeta: [],
  mapMetaLoaded: false,
  mapMetaSlicesLoaded: [],
  bestByEvent: {},
  starpowerMeta: [],
  starpowerMetaLoaded: false,
  modeMeta: [],
  modeMetaLoaded: false,
  cookiesAllowed: false,
  adsAllowed: false,
  adsEnabled: true,
  installBannerDismissed: false,
  totalBrawlers: 35,
  bsuArticles: [],
  bsuArticlesLoaded: false,
  isApp: false,
  installPrompt: undefined,
})

export const getters = {
  playerRank(state) {
    if (state.player.tag === '' || !state.leaderboardLoaded) {
      return 0
    }

    return state.leaderboard
      .map(({ tag }) => tag)
      .indexOf(state.player.tag) + 1
  },
  topBrawlers(state) {
    const props = Object.keys(metaStatMaps.labels)
    const max = {}

    state.brawlerMeta.forEach((entry) => {
      props.forEach((prop) => {
        if ((!(prop in max) || max[prop].stats[prop] < entry.stats[prop]) &&
          entry.stats[prop] !== undefined && entry.stats[prop] !== 0) {
          max[prop] = entry
        }
      })
    })

    return max
  },
  isInstallable(state) {
    const isAndroid = process.client && /android/i.test(navigator.userAgent)
    return state.installPrompt !== undefined || (!state.isApp && isAndroid)
  },
}

export const mutations = {
  setBlog(state, blog) {
    state.blog = blog
  },
  setFeaturedPlayers(state, featuredPlayers) {
    state.featuredPlayers = featuredPlayers
  },
  setPlayer(state, player) {
    state.player = player
  },
  addLastPlayer(state, player) {
    const clone = obj => JSON.parse(JSON.stringify(obj))

    const lastPlayers = [clone(player), ...state.lastPlayers]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    state.lastPlayers = lastPlayers.slice(0, 4)
  },
  setCurrentEvents(state, currentEvents) {
    state.currentEvents = currentEvents
    state.currentEventsLoaded = true
  },
  setUpcomingEvents(state, upcomingEvents) {
    state.upcomingEvents = upcomingEvents
    state.upcomingEventsLoaded = true
  },
  setLeaderboard(state, leaderboard) {
    state.leaderboard = leaderboard
    state.leaderboardLoaded = true
  },
  setBrawlerMeta(state, meta) {
    state.brawlerMeta = meta
    state.brawlerMetaLoaded = true
  },
  setMapMeta(state, meta) {
    state.mapMeta = meta
    state.bestByEvent = getBestByEvent(state.mapMeta)

    state.mapMetaLoaded = true
  },
  setStarpowerMeta(state, meta) {
    state.starpowerMeta = meta
    state.starpowerMetaLoaded = true
  },
  addMapMetaSlice(state, metaSlice) {
    state.mapMeta = {
      ...state.mapMeta,
      ...metaSlice,
    }
    state.bestByEvent = getBestByEvent(state.mapMeta)
  },
  setMapMetaSliceLoaded(state, sliceName) {
    state.mapMetaSlicesLoaded.push(sliceName)
  },
  setModeMeta(state, meta) {
    state.modeMeta = meta
    state.modeMetaLoaded = true
  },
  allowAds(state) {
    state.adsAllowed = true
  },
  disallowAds(state) {
    state.adsAllowed = false
  },
  enableAds(state) {
    state.adsEnabled = true
  },
  disableAds(state) {
    state.adsEnabled = false
  },
  allowCookies(state) {
    state.cookiesAllowed = true
  },
  clearCookieSettings(state) {
    state.adsAllowed = false
    state.cookiesAllowed = false
  },
  dismissInstallBanner(state) {
    state.installBannerDismissed = true
  },
  setBsuArticles(state, articles) {
    state.bsuArticles = articles
    state.bsuArticlesLoaded = true
  },
  setIsApp(state) {
    state.isApp = true
  },
  setInstallPrompt(state, prompt) {
    state.installPrompt = prompt
  },
  clearInstallPrompt(state) {
    state.installPrompt = undefined
  },
}

export const actions = {
  async nuxtServerInit({ commit }) {
    if (process.static) {
      return
    }

    // overwrite generated (possibly empty) payload
    // with current API data when running on server
    await Promise.all([
      this.$axios.$get('/api/blog').then(blog => commit('setBlog', blog)),
      this.$axios.$get('/api/featured-players').then(players => commit('setFeaturedPlayers', players)),
    ])
  },
  async loadPlayer({ state, commit }, playerTag) {
    if (playerTag === state.player.tag) {
      return
    }

    const player = await this.$axios.$get(`/api/player/${playerTag}`)
    commit('setPlayer', player)
  },
  async refreshPlayer({ state, commit }) {
    const player = await this.$axios.$get(`/api/player/${state.player.tag}`)
    commit('setPlayer', player)
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
  async loadUpcomingEvents({ state, commit }) {
    if (state.upcomingEventsLoaded) {
      return
    }

    try {
      const upcomingEvents = await this.$axios.$get('/api/upcoming-events')
      commit('setUpcomingEvents', upcomingEvents)
    } catch (error) {
      // not critical, ignore
      exception('cannot get upcoming events: ' + error.message)
      console.error('cannot get upcoming events:', error.message)
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
  async loadBrawlerMeta({ state, commit }) {
    if (state.brawlerMetaLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta/brawler')
      commit('setBrawlerMeta', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get brawler meta: ' + error.message)
      console.error('cannot get brawler meta:', error.message)
    }
  },
  async loadMapMeta({ state, commit }) {
    if (state.mapMetaLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta/map')
      commit('setMapMeta', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get map meta: ' + error.message)
      console.error('cannot get map meta:', error.message)
    }
  },
  async loadMapMetaSlice({ state, commit }, sliceName) {
    if (state.mapMetaLoaded ||
        state.mapMetaSlicesLoaded.includes(sliceName)) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta/map?' + sliceName)
      commit('addMapMetaSlice', meta)
      commit('setMapMetaSliceLoaded', sliceName)
    } catch (error) {
      // not critical, ignore
      exception('cannot get map meta slice: ' + error.message)
      console.error('cannot get map meta slice:', error.message)
    }
  },
  async loadCurrentMeta({ dispatch }) {
    await dispatch('loadCurrentEvents')
    await dispatch('loadMapMetaSlice', 'current')
  },
  async loadStarpowerMeta({ state, commit }) {
    if (state.starpowerMetaLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta/starpower')
      commit('setStarpowerMeta', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get starpower meta: ' + error.message)
      console.error('cannot get starpower meta:', error.message)
    }
  },
  async loadModeMeta({ state, commit }) {
    if (state.modeMetaLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/meta/mode')
      commit('setModeMeta', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get mode meta: ' + error.message)
      console.error('cannot get mode meta:', error.message)
    }
  },
  async loadBsuArticles({ state, commit }) {
    if (state.bsuArticlesLoaded) {
      return
    }

    try {
      const meta = await this.$axios.$get('/api/partners/bsu')
      commit('setBsuArticles', meta)
    } catch (error) {
      // not critical, ignore
      exception('cannot get bsu articles: ' + error.message)
      console.error('cannot get bsu articles:', error.message)
    }
  },
  async install({ state, commit }) {
    const pwaSupported = state.installPrompt !== undefined
    if (!pwaSupported) {
      const referrer = '&referrer=utm_source%3Dwebsite%26utm_medium%3Dfallback'
      event('app', 'redirect_store', 'fallback')
      window.open('https://play.google.com/store/apps/details?id=xyz.schneefux.brawltimeninja' + referrer, '_blank')
    } else {
      state.installPrompt.prompt()
      const choice = await state.installPrompt.userChoice
      event('app', 'prompt', choice.outcome)
      commit('clearInstallPrompt')
    }
  },
}
