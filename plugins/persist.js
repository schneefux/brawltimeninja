import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: `brawlstars-ninja`,
    reducer: state => ({
      version: 2,
      lastPlayers: state.lastPlayers,
    }),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key)
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {})

      if (value.version === undefined || value.version === 1) {
        if (value.lastPlayers !== undefined) {
          // 0 -> 1: rename player.id -> player.tag
          // 1 -> 2: it broke for some reason so just do it again
          value.lastPlayers.forEach((player) => {
            if (player.id !== undefined) {
              player.tag = player.id
              delete player.id
            }
          })
        }
      }

      return value
    }
  }).plugin(store))
}
