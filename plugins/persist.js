import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  window.onNuxtReady(() => new VuexPersistence({
    key: `brawlstars-ninja`,
    reducer: state => ({
      version: state.version,
      lastPlayers: state.lastPlayers,
    }),
    restoreState: (key, storage) => {
      // pass through (https://github.com/championswimmer/vuex-persist/blob/master/src/index.ts#L189)
      let value = (storage).getItem(key)
      value = typeof value === 'string' ? JSON.parse(value || '{}') : (value || {})

      if (value.version === undefined) {
        if (value.lastPlayers !== undefined) {
          // v0 -> v1: rename player.id -> player.tag
          value.lastPlayers.forEach((player) => {
            player.tag = player.id
            delete player.id
          })
        }
      }

      value.version = 1

      return value
    }
  }).plugin(store))
}
