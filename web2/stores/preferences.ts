import { defineStore } from 'pinia'

interface StoredPlayer {
  tag: string
  name: string
}

interface State {
  version: string|undefined
  lastPlayers: StoredPlayer[]
  userTag: string|undefined
  personalityTestResult: string|undefined
  cookiesAllowed: boolean|undefined
  adsAllowed: boolean|undefined
  installBannerDismissed: boolean
}

export interface PlayerTotals {
  picks: number
  winRate: number
  trophyChange: number
}

export const usePreferencesStore = defineStore('preferences', {
  state: (): State => ({
    version: undefined,
    lastPlayers: [],
    userTag: undefined, // personal tag (last searched)
    personalityTestResult: undefined,
    cookiesAllowed: undefined,
    adsAllowed: undefined,
    installBannerDismissed: false,
  }),
  getters: {
    consentPopupVisible(state): boolean {
      return !import.meta.env.SSR && (state.cookiesAllowed == undefined || state.adsAllowed == undefined)
    },
  },
  actions: {
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
    withdrawConsent() {
      this.cookiesAllowed = undefined
      this.adsAllowed = undefined
    },
    dismissInstallBanner() {
      this.installBannerDismissed = true
    },
    setPersonalityTestResult(result: string) {
      this.personalityTestResult = result
    },
    setUserTag(tag: string) {
      this.userTag = tag
    },
  },
  persist: {
    key: 'brawlstars-ninja',
    afterRestore(ctx) {
      // v10: migration to pinia-plugin-persistedstate
      ctx.store.$state.version = 10
    },
  },
})

