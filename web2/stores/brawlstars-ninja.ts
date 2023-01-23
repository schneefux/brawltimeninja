import { defineStore } from 'pinia'
import { tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

interface StoredPlayer {
  tag: string
  name: string
}

interface State {
  version: string|undefined
  featuredPlayers: StoredPlayer[]
  lastPlayers: StoredPlayer[]
  userTag: string|undefined
  personalityTestResult: string|undefined
  cookiesAllowed: boolean|undefined
  adsAllowed: boolean|undefined
  consentPopupVisible: boolean
  installBannerDismissed: boolean
  totalBrawlers: number
  player: Player|undefined
  playerTotals: PlayerTotals|undefined
}

export interface PlayerTotals {
  picks: number
  winRate: number
  trophyChange: number
}

export const useBrawlstarsNinjaStore = defineStore('brawlstars-ninja', {
  state: (): State => ({
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
    lastPlayers: [],
    userTag: undefined, // personal tag (last searched)
    personalityTestResult: undefined,
    cookiesAllowed: undefined,
    adsAllowed: undefined,
    consentPopupVisible: false,
    installBannerDismissed: false,
    totalBrawlers: 56,
    player: undefined,
    playerTotals: undefined,
  }),
  actions: {
    async loadPlayer(tag: string) {
      const player = await this.api.player.byTag.query(tag)
      this.setPlayer(player)

      const battleData = await this.klicker.query({
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
        const totals = battleData.data[0].metricsRaw as PlayerTotals
        this.setPlayerTotals(totals)
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
        }
        this.setPlayerTotals(totals)
      }
    },
    addLastPlayer(player: StoredPlayer) {
      const clone = (obj: any) => JSON.parse(JSON.stringify(obj))

      const lastPlayers = [clone(player), ...this.lastPlayers]
        .filter((player, index, arr) => index == arr.findIndex(p => p.tag == player.tag)) // unique
      this.lastPlayers = lastPlayers.slice(0, 4)
    },
    setAdsAllowed(adsAllowed: boolean) {
      this.adsAllowed = adsAllowed
    },
    setCookiesAllowed(cookiesAllowed: boolean) {
      this.cookiesAllowed = cookiesAllowed
    },
    showConsentPopup() {
      this.consentPopupVisible = true
    },
    hideConsentPopup() {
      this.consentPopupVisible = false
    },
    dismissInstallBanner() {
      this.installBannerDismissed = true
    },
    setPersonalityTestResult(result: string) {
      this.personalityTestResult = result
    },
    setPlayer(player: Player) {
      this.player = player
    },
    setPlayerTotals(totals: PlayerTotals) {
      this.playerTotals = totals
    },
    setUserTag(tag: string) {
      this.userTag = tag
    },
  },
  persist: {
    key: 'brawlstars-ninja',
    paths: ['version', 'lastPlayers', 'cookiesAllowed', 'adsAllowed', 'installBannerDismissed', 'personalityTestResult', 'userTag'],
    afterRestore(ctx) {
      // v10: migration to pinia-plugin-persistedstate
      ctx.store.$state.version = 10
    }
  },
})

