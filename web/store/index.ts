import { event } from 'vue-gtag'
import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

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

export interface PlayerTotals {
  picks: number
  winRate: number
  trophyChange: number
}

export const state = () => ({
  version: undefined,
  featuredPlayers: [ {
      tag: 'V8LLPPC',
      name: 'xXcuzMePlisThXx',
    }, {
      tag: 'VLQPVPY',
      name: 'Hyra',
    }, {
      tag: '2YC9RVYQC',
      name: 'NaVi | Cubick',
    }, {
      tag: '8LQ9JR82',
      name: 'BGT | Eqwaak',
    }, {
      tag: 'QRUQQLV0',
      name: 'CG |Nukleo',
    } ],
  lastPlayers: [] as string[],
  userTag: undefined as undefined|string, // personal tag (last searched)
  personalityTestResult: undefined,
  cookiesAllowed: undefined as undefined|boolean,
  adsAllowed: undefined as undefined|boolean,
  consentPopupVisible: false,
  installBannerDismissed: false,
  totalBrawlers: 56,
  isApp: undefined as undefined|boolean,
  installPrompt: undefined as any,
  player: undefined as undefined|Player,
  playerTotals: undefined as undefined|PlayerTotals,
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
  addLastPlayer(state, player) {
    const clone = obj => JSON.parse(JSON.stringify(obj))

    const lastPlayers = [clone(player), ...state.lastPlayers]
      .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
    state.lastPlayers = lastPlayers.slice(0, 4)
  },
  setAdsAllowed(state, adsAllowed) {
    state.adsAllowed = adsAllowed
  },
  setCookiesAllowed(state, cookiesAllowed) {
    state.cookiesAllowed = cookiesAllowed
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
  setIsApp(state, isApp) {
    state.isApp = isApp
  },
  setInstallPrompt(state, prompt) {
    state.installPrompt = prompt
  },
  clearInstallPrompt(state) {
    state.installPrompt = undefined
  },
  setPersonalityTestResult(state, result) {
    state.personalityTestResult = result
  },
  setPlayer(state, player) {
    state.player = player
  },
  setPlayerTotals(state, totals) {
    state.playerTotals = totals
  },
  setUserTag(state, tag) {
    state.userTag = tag
  },
}

export const actions: ActionTree<RootState, RootState> = {
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
  async loadPlayer({ commit }, tag) {
    const player = await this.$api.query('player.byTag', tag)
    commit('setPlayer', player)

    const battleData = await this.$klicker.query({
      cubeId: 'battle',
      dimensionsIds: [],
      metricsIds: ['picks', 'winRate', 'trophyChange'],
      slices: {
        playerId: [tagToId(tag)],
      },
      sortId: 'picks',
    }).catch(() => ({
      data: [{
        metricsRaw: {
          picks: 0,
        },
      }],
    }))

    if (battleData.data[0].metricsRaw.picks > 0) {
      const totals = battleData.data[0].metricsRaw as any as PlayerTotals
      commit('setPlayerTotals', totals)
    } else {
      // calculate player totals from battle log
      const picks = player.battles.length
      const trophyChanges = player.battles
        .map((battle) => battle.trophyChange!)
        .filter((trophyChange) => trophyChange != undefined)
      const trophyChange = trophyChanges.length == 0 ? 0 : trophyChanges.reduce((sum, t) => sum + t, 0) / trophyChanges.length
      const winRate = player.battles.length == 0 ? 0 : player.battles.filter((battle) => battle.victory).length / player.battles.length

      const totals = {
        picks,
        trophyChange,
        winRate,
      } as PlayerTotals
      commit('setPlayerTotals', totals)
    }
  },
}
