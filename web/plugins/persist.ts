import { Plugin } from '@nuxt/types'
import VuexPersistence from 'vuex-persist'

const plugin: Plugin = ({ store }) => {
  (<any>window).onNuxtReady(() => new VuexPersistence({
    key: 'brawlstars-ninja',
    reducer: (state: any) => ({
      version: state.version,
      lastPlayers: state.lastPlayers,
      cookiesAllowed: state.cookiesAllowed,
      adsAllowed: state.adsAllowed,
      installBannerDismissed: state.installBannerDismissed,
      personalityTestResult: state.personalityTestResult,
      userTag: state.userTag,
    }),
    restoreState: (key: string, storage: any) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key)
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {})

      if (value.lastPlayers !== undefined) {
        // 0 -> 1: rename player.id -> player.tag
        // 1 -> 4: it broke for some reason, trying to fix it…
        value.lastPlayers.forEach((player) => {
          if (player.tag === undefined && player.id !== undefined) {
            player.tag = player.id
            delete player.id
          }
        })
      }

      if (value.installBannerDismissed === undefined) {
        value.installBannerDismissed = false
      }

      // 6 -> 7: store ads and cookie settings in a cookie
      if (value.adsAllowed) {
        document.cookie = `ads=true; path=/; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
      }

      if (value.cookiesAllowed) {
        document.cookie = `cookies=true; path=/; expires=${new Date(Date.now() + 365*24*60*60*1000)}`
      }

      // 7 -> 8: store user tag in localStorage instead of cookie
      // (keep number of cookies to a minimum to take advantage of `cached` middleware)
      if (document.cookie.includes('usertag=')) {
        const cookie = RegExp('usertag=[^;]+').exec(document.cookie)
        const userTag = decodeURIComponent(!!cookie ? cookie.toString().replace(/^[^=]+./, '') : '')
        document.cookie = 'usertag=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setTimeout(() => store.commit('setUserTag', userTag), 0) // force persist in next tick
      }

      value.version = 8

      return value
    }
  }).plugin(store))
}

export default plugin
