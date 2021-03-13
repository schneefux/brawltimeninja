import { event } from 'vue-gtag'
import { GetterTree, ActionTree, MutationTree } from 'vuex'

function detectAndroid() {
  return /android/i.test(navigator.userAgent)
}

function detectIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
}

export const state = () => ({
  version: undefined,
  featuredPlayers: [ {
      tag: 'V8LLPPC',
      name: 'xXcuzMePlisThXx',
    }, {
      tag: '8PJRRG2C',
      name: 'TQ|GuilleVGX',
    }, {
      tag: 'V9QGJY9',
      name: 'Landi',
    }, {
      tag: '2L892GP',
      name: 'YAPIMARU_YT',
    }, {
      tag: '2Y02L28',
      name: 'Keith ツ',
    } ],
  tagPattern: '^[0289PYLQGRJCUV]{3,}$',
  lastPlayers: [] as string[],
  player: {
    tag: '',
  }, // cached API response
  userTag: undefined as undefined|string, // personal tag (last searched)
  personalityTestResult: undefined,
  cookiesAllowed: false,
  adsAllowed: false,
  consentPopupVisible: false,
  installBannerDismissed: false,
  totalBrawlers: 44,
  isApp: false,
  installPrompt: undefined as any,
  testGroup: undefined as undefined|string,
})

export type RootState = ReturnType<typeof state>

export const getters: GetterTree<RootState, RootState> = {
  isInstallable(state) {
    if (state.isApp) {
      return false
    }
    if (!process.client) {
      return false
    }
    if (state.installPrompt !== undefined) {
      return true
    }
    return detectAndroid() || detectIOS()
  },
}

export const mutations: MutationTree<RootState> = {
  setPlayer(state, player) {
    state.player = player
  },
  addLastPlayer(state, player) {
    const clone = obj => JSON.parse(JSON.stringify(obj))

    const lastPlayers = [clone(player), ...state.lastPlayers]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    state.lastPlayers = lastPlayers.slice(0, 4)
  },
  allowAds(state) {
    state.adsAllowed = true
  },
  disallowAds(state) {
    state.adsAllowed = false
  },
  allowCookies(state) {
    state.cookiesAllowed = true
  },
  disallowCookies(state) {
    state.cookiesAllowed = false
  },
  showConsentPopup(state) {
    state.consentPopupVisible = true
  },
  hideConsentPopup(state) {
    state.consentPopupVisible = false
  },
  dismissInstallBanner(state) {
    state.installBannerDismissed = true
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
  setTestGroup(state, group) {
    state.testGroup = group
  },
  setPersonalityTestResult(state, result) {
    state.personalityTestResult = result
  },
}

export const actions: ActionTree<RootState, RootState> = {
  async loadPlayer({ state, commit }, playerTag) {
    if (playerTag === state.player.tag) {
      return
    }

    const player = await this.$http.$get((<any>this).$config.apiUrl + `/api/player/${playerTag}`)
    commit('setPlayer', player)
  },
  async refreshPlayer({ state, commit }) {
    const player = await this.$http.$get((<any>this).$config.apiUrl + `/api/player/${state.player.tag}`)
    commit('setPlayer', player)
  },
  async install({ state, commit }) {
    const pwaSupported = state.installPrompt !== undefined
    if (pwaSupported) {
      state.installPrompt.prompt()
      const choice = await state.installPrompt.userChoice
      event('prompt', {
        'event_category': 'app',
        'event_label': choice.outcome,
      })
      commit('clearInstallPrompt')
      return
    }

    if (detectAndroid()) {
      const referrer = '&referrer=utm_source%3Dwebsite%26utm_medium%3Dfallback'
      event('redirect_store', {
        'event_category': 'app',
        'event_label': 'fallback',
      })
      window.open('https://play.google.com/store/apps/details?id=xyz.schneefux.brawltimeninja' + referrer, '_blank')
      return
    }

    if (detectIOS()) {
      event('redirect_guide', {
        'event_category': 'app',
        'event_label': 'ios',
      })
      this.$router.push('/install/ios')
      return
    }
  },
}
