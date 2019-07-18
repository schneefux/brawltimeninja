import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: `brawlstars-ninja`,
    reducer: state => ({
      version: state.version,
      lastPlayers: state.lastPlayers,
      cookiesAllowed: state.cookiesAllowed,
      adsAllowed: state.adsAllowed,
      installBannerDismissed: state.installBannerDismissed,
    }),
    restoreState: (key, storage) => {
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

      value.version = 6

      return value
    }
  }).plugin(store))
}
