import { ActionTree, MutationTree } from 'vuex'
import { tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

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
  player: undefined as undefined|Player,
  playerTotals: undefined as undefined|PlayerTotals,
})

export type RootState = ReturnType<typeof state>

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
