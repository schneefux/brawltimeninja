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
      // (deleted)

      // 7 -> 8: store user tag in localStorage instead of cookie
      // (keep number of cookies to a minimum to take advantage of `cached` middleware)
      if (document.cookie.includes('usertag=')) {
        const cookie = RegExp('usertag=[^;]+').exec(document.cookie)
        const userTag = decodeURIComponent(!!cookie ? cookie.toString().replace(/^[^=]+./, '') : '')
        document.cookie = 'usertag=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setTimeout(() => store.commit('setUserTag', userTag), 0) // force persist in next tick
      }

      // 8 -> 9: store ads and cookie settings in localStorage again (Analytics Cookies mess up caching)
      if (document.cookie.includes('ads=true') || document.cookie.includes('ads=false')) {
        const adsAllowed = document.cookie.includes('ads=true')
        value.adsAllowed = adsAllowed
        // force persist in next tick
        setTimeout(() => store.commit('setAdsAllowed', adsAllowed), 0)
        document.cookie = 'ads=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }

      if (document.cookie.includes('cookies=true') || document.cookie.includes('cookies=false')) {
        const cookiesAllowed = document.cookie.includes('cookies=true')
        value.cookiesAllowed = cookiesAllowed
        // force persist in next tick
        setTimeout(() => store.commit('setCookiesAllowed', cookiesAllowed), 0)
        document.cookie = 'cookies=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      }

      value.version = 9

      return value
    }
  }).plugin(store))
}

export default plugin
